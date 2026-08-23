import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isSessionUser } from '@/lib/auth';

// GET aggregate business analytics — admin only.
export async function GET() {
  const userOrResponse = await requireAdmin();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  try {
    const [sales, products] = await Promise.all([
      prisma.sale.findMany({
        where: { status: { not: 'Refunded' } },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.product.findMany(),
    ]);

    const totalRevenue = sales.reduce(
      (sum: number, s: { totalAmount: number }) => sum + s.totalAmount,
      0
    );
    const totalOrders = sales.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    let totalGrossProfit = 0;
    const revenueByDayMap = new Map<string, number>();
    const revenueByCategoryMap = new Map<string, number>();
    const unitsByProduct = new Map<string, { name: string; unitsSold: number; revenue: number }>();

    for (const sale of sales) {
      const day = sale.createdAt.toISOString().slice(0, 10);
      revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + sale.totalAmount);

      for (const item of sale.items) {
        const lineRevenue = item.price * item.quantity;
        const lineCost = (item.product?.costPrice ?? 0) * item.quantity;
        totalGrossProfit += lineRevenue - lineCost;

        const category = item.product?.category ?? 'Uncategorized';
        revenueByCategoryMap.set(category, (revenueByCategoryMap.get(category) ?? 0) + lineRevenue);

        const key = item.productId;
        const existing = unitsByProduct.get(key);
        const name = item.product?.name ?? 'Unknown product';
        if (existing) {
          existing.unitsSold += item.quantity;
          existing.revenue += lineRevenue;
        } else {
          unitsByProduct.set(key, { name, unitsSold: item.quantity, revenue: lineRevenue });
        }
      }
    }

    const revenueByDay = [...revenueByDayMap.entries()]
      .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    const revenueByCategory = [...revenueByCategoryMap.entries()].map(([category, revenue]) => ({
      category,
      revenue: Math.round(revenue * 100) / 100,
    }));

    const topProducts = [...unitsByProduct.values()]
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5)
      .map((p) => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));

    const lowStockCount = products.filter((p: { stockQuantity: number }) => p.stockQuantity <= 5).length;

    return NextResponse.json(
      {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalGrossProfit: Math.round(totalGrossProfit * 100) / 100,
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        lowStockCount,
        revenueByDay,
        revenueByCategory,
        topProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics.' }, { status: 500 });
  }
}
