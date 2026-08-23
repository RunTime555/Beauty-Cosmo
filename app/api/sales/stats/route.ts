import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, isSessionUser } from '@/lib/auth';

// GET today's sales snapshot for the dashboard header cards.
export async function GET() {
  const userOrResponse = await requireUser();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaySales = await prisma.sale.findMany({
      where: { createdAt: { gte: startOfDay }, status: { not: 'Refunded' } },
      select: { totalAmount: true },
    });

    const todayRevenue = todaySales.reduce(
      (sum: number, s: { totalAmount: number }) => sum + s.totalAmount,
      0
    );

    return NextResponse.json(
      { todayRevenue, todayOrders: todaySales.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch sales stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales stats.' }, { status: 500 });
  }
}
