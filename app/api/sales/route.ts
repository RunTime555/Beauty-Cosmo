import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Type definitions for request items
interface SaleItemPayload {
  productId: string;
  quantity: number | string;
  price: number | string;
}

// GET all sales transactions with nested items
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error('Fetch sales error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales history' }, { status: 500 });
  }
}

// POST create sale and update product stock/status
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sellerName, totalAmount, taxAmount, items } = body as {
      sellerName: string;
      totalAmount: number | string;
      taxAmount: number | string;
      items: SaleItemPayload[];
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty items array' }, { status: 400 });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create Sale Record
      const sale = await tx.sale.create({
        data: {
          sellerName,
          totalAmount: parseFloat(String(totalAmount)),
          taxAmount: parseFloat(String(taxAmount)),
          items: {
            create: items.map((i: SaleItemPayload) => ({
              productId: i.productId,
              quantity: parseInt(String(i.quantity), 10),
              price: parseFloat(String(i.price)),
            })),
          },
        },
      });

      // 2. Decrement stock & update status
      for (const item of items) {
        const qty = parseInt(String(item.quantity), 10);

        const currentProduct = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockQuantity: true },
        });

        if (!currentProduct) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }

        const updatedQuantity = Math.max(0, currentProduct.stockQuantity - qty);
        const updatedStatus = updatedQuantity <= 5 ? 'Low_Stock' : 'In_Stock';

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: updatedQuantity,
            status: updatedStatus,
          },
        });
      }

      return sale;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Sale transaction error:', error);
    const message = error instanceof Error ? error.message : 'Failed to record sale';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}