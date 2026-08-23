import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireUser, isSessionUser } from '@/lib/auth';
import { statusForQuantity, validateProductInput } from '@/lib/validation';

// GET all products — any signed-in user (admin or seller) can view stock.
export async function GET() {
  const userOrResponse = await requireUser();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
  }
}

// POST create a new product — admin only.
export async function POST(request: Request) {
  const userOrResponse = await requireAdmin();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  try {
    const body = await request.json();
    const validated = validateProductInput(body);
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { name, category, sku, costPrice, sellingPrice, stockQuantity, imageUrl } = validated.data;

    const newProduct = await prisma.product.create({
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

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A product with that SKU already exists.' }, { status: 409 });
    }
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to save product.' }, { status: 500 });
  }
}
