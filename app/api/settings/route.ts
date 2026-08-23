import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireUser, isSessionUser } from '@/lib/auth';

// GET store settings — any signed-in user can read (e.g. tax rate for receipts).
export async function GET() {
  const userOrResponse = await requireUser();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  try {
    const settings = await prisma.storeSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings.' }, { status: 500 });
  }
}

// PUT update store settings — admin only.
export async function PUT(request: Request) {
  const userOrResponse = await requireAdmin();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  try {
    const body = await request.json();
    const storeName = typeof body.storeName === 'string' ? body.storeName.trim() : '';
    const taxRate = Number(body.taxRate);
    const currencySymbol = typeof body.currencySymbol === 'string' ? body.currencySymbol.trim() : '';

    if (!storeName) return NextResponse.json({ error: 'Store name is required.' }, { status: 400 });
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      return NextResponse.json({ error: 'Tax rate must be between 0 and 100.' }, { status: 400 });
    }
    if (!currencySymbol) {
      return NextResponse.json({ error: 'Currency symbol is required.' }, { status: 400 });
    }

    const settings = await prisma.storeSettings.upsert({
      where: { id: 1 },
      update: { storeName, taxRate, currencySymbol },
      create: { id: 1, storeName, taxRate, currencySymbol },
    });

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}
