import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all products from PostgreSQL
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products from PostgreSQL' }, { status: 500 });
  }
}

// POST create a new product in PostgreSQL
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, sku, costPrice, sellingPrice, stockQuantity, imageUrl } = body;

    // Determine status automatically based on quantity
    let status: 'In_Stock' | 'Low_Stock' = stockQuantity <= 5 ? 'Low_Stock' : 'In_Stock';

    const newProduct = await prisma.product.create({
      data: {
        name,
        category,
        sku,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        stockQuantity: parseInt(stockQuantity, 10),
        status,
        imageUrl,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save product to PostgreSQL' }, { status: 500 });
  }
}