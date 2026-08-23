import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireUser, isSessionUser } from '@/lib/auth';
import { statusForQuantity, validateProductInput } from '@/lib/validation';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET a single product — any signed-in user.
export async function GET(_request: Request, { params }: RouteParams) {
  const userOrResponse = await requireUser();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Fetch product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product.' }, { status: 500 });
  }
}

// PATCH update a product — admin only.
export async function PATCH(request: Request, { params }: RouteParams) {
  const userOrResponse = await requireAdmin();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = validateProductInput(body);
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { name, category, sku, costPrice, sellingPrice, stockQuantity, imageUrl } = validated.data;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        category,
        sku,
        costPrice,
        sellingPrice,
        stockQuantity,
        status: statusForQuantity(stockQuantity),
        imageUrl,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'A product with that SKU already exists.' }, { status: 409 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
      }
    }
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product.' }, { status: 500 });
  }
}

// DELETE a product — admin only. Blocked if it has sale history (data integrity).
export async function DELETE(_request: Request, { params }: RouteParams) {
  const userOrResponse = await requireAdmin();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  const { id } = await params;

  try {
    const saleItemCount = await prisma.saleItem.count({ where: { productId: id } });
    if (saleItemCount > 0) {
      return NextResponse.json(
        { error: 'This product has sales history and cannot be deleted. Consider marking it out of stock instead.' },
        { status: 409 }
      );
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product.' }, { status: 500 });
  }
}
