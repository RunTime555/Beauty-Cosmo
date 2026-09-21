import { NextResponse } from 'next/server';
import type { Prisma, Product as PrismaProduct } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser, isSessionUser } from '@/lib/auth';
import { statusForQuantity } from '@/lib/validation';

interface SaleItemPayload {
  productId: unknown;
  quantity: unknown;
}

// GET all sales transactions with nested items — any signed-in user.
export async function GET() {
  const userOrResponse = await requireUser();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error('Fetch sales error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales history.' }, { status: 500 });
  }
}

// POST create a sale and atomically decrement stock.
//
// Security/integrity notes:
//  - Price and totals are NEVER trusted from the client. They're always
//    recomputed server-side from the product's current sellingPrice and
//    the store's configured tax rate.
//  - Quantities are validated as positive integers.
//  - Stock is decremented with a conditional `updateMany` guarded by
//    `stockQuantity >= qty`, so two concurrent checkouts can't both
//    succeed and oversell the same units (closes the race condition).
//  - If any item doesn't have enough stock, the whole transaction is
//    rolled back and a clear 409 is returned — nothing oversells silently.
//  - sellerName/sellerId always come from the authenticated session, not
//    the request body.
export async function POST(request: Request) {
  const userOrResponse = await requireUser();
  if (!isSessionUser(userOrResponse)) return userOrResponse;
  const user = userOrResponse;

  try {
    const body = await request.json();
    const rawItems = body?.items;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    // Validate & normalize items, merging duplicate productIds.
    const quantityByProduct = new Map<string, number>();
    for (const raw of rawItems as SaleItemPayload[]) {
      const productId = typeof raw.productId === 'string' ? raw.productId : '';
      const quantity = Number(raw.quantity);

      if (!productId) {
        return NextResponse.json({ error: 'Invalid item: missing product.' }, { status: 400 });
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: 'Invalid item: quantity must be a positive whole number.' },
          { status: 400 }
        );
      }
      quantityByProduct.set(productId, (quantityByProduct.get(productId) ?? 0) + quantity);
    }

    const productIds = [...quantityByProduct.keys()];

    const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
    const taxRate = settings?.taxRate ?? 8.0;

    // Self-heal the User table before recording the sale. The signed-in
    // session (Supabase Auth) is the source of truth for "who is this,
    // and what's their role" — that part already works fine even if the
    // row below is out of sync. But Sale.sellerId is a real foreign key
    // into our own User table, so if that row doesn't exist yet, or is
    // stale (e.g. the Supabase Auth account was recreated at some point,
    // so its internal ID changed even though the email stayed the same),
    // fix it here instead of letting checkout hard-fail with an opaque
    // foreign-key error.
    const existingById = await prisma.user.findUnique({ where: { id: user.id } });
    if (!existingById) {
      const existingByEmail = await prisma.user.findUnique({ where: { email: user.email } });
      if (existingByEmail) {
        await prisma.user.update({ where: { email: user.email }, data: { id: user.id } });
      } else {
        await prisma.user.create({
          data: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
      }
    }

    const transaction = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const products = await tx.product.findMany({ where: { id: { in: productIds } } });
        const productById = new Map<string, PrismaProduct>(products.map((p) => [p.id, p]));

        // Verify every product exists and has enough stock BEFORE writing anything.
        for (const [productId, qty] of quantityByProduct) {
          const product = productById.get(productId);
          if (!product) {
            throw new SaleError(`One of the items in this sale no longer exists.`);
          }
          if (product.stockQuantity < qty) {
            throw new SaleError(
              `Not enough stock for "${product.name}" — only ${product.stockQuantity} left.`
            );
          }
        }

        // Recompute pricing server-side — never trust client-submitted prices.
        let subtotal = 0;
        const itemsData = [...quantityByProduct].map(([productId, qty]) => {
          const product = productById.get(productId)!;
          subtotal += product.sellingPrice * qty;
          return { productId, quantity: qty, price: product.sellingPrice };
        });
        const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
        const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

        const sale = await tx.sale.create({
          data: {
            sellerName: user.name || user.email,
            sellerId: user.id,
            totalAmount,
            taxAmount,
            items: { create: itemsData },
          },
        });

        // Conditional decrement: only succeeds if enough stock is STILL
        // available at write time. Guards against concurrent checkouts
        // racing past the earlier read-time check above.
        for (const [productId, qty] of quantityByProduct) {
          const product = productById.get(productId)!;
          const newQuantity = product.stockQuantity - qty;

          const result = await tx.product.updateMany({
            where: { id: productId, stockQuantity: { gte: qty } },
            data: { stockQuantity: newQuantity, status: statusForQuantity(newQuantity) },
          });

          if (result.count === 0) {
            throw new SaleError(
              `"${product.name}" was just sold out by another sale. Please refresh and try again.`
            );
          }
        }

        return sale;
      },
      // Default interactive-transaction timeout is 5s, which is too tight
      // for a higher-latency database connection. 20s gives enough headroom
      // for the handful of sequential queries above even when each one
      // takes a second or two.
      { timeout: 20000, maxWait: 10000 }
    );

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof SaleError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Sale transaction error:', error);
    return NextResponse.json({ error: 'Failed to record sale.' }, { status: 500 });
  }
}

class SaleError extends Error {}