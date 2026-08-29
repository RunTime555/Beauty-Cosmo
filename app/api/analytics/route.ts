import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isSessionUser } from '@/lib/auth';

type RangeType = 'all' | 'week' | 'month';

/**
 * Computes the [start, end) boundaries for a week or month containing the
 * given anchor date, in the server's local time zone. Weeks run
 * Monday–Sunday. Returns null bounds for 'all' (no filtering).
 */
function computePeriod(range: RangeType, anchor: Date) {
  if (range === 'week') {
    const day = anchor.getDay(); // 0 = Sunday .. 6 = Saturday
    const diffToMonday = (day + 6) % 7;
    const start = new Date(anchor);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const label = `Week of ${start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} – ${new Date(end.getTime() - 1).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
    return { start, end, label };
  }

  if (range === 'month') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
    const label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { start, end, label };
  }

  return { start: null, end: null, label: 'All Time' };
}

// GET aggregate business analytics — admin only.
// Query params: range=all|week|month, anchor=ISO date (defaults to now).
// "anchor" is any date that falls inside the desired week/month, letting
// the client page through history via Previous/Next without the server
// needing to know about pagination — it just recomputes the period.
export async function GET(request: Request) {
  const userOrResponse = await requireAdmin();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range');
    const range: RangeType = rangeParam === 'week' || rangeParam === 'month' ? rangeParam : 'all';
    const anchorParam = searchParams.get('anchor');
    const anchor = anchorParam && !Number.isNaN(Date.parse(anchorParam)) ? new Date(anchorParam) : new Date();

    const { start: periodStart, end: periodEnd, label: periodLabel } = computePeriod(range, anchor);

    const saleWhere =
      periodStart && periodEnd
        ? { status: { not: 'Refunded' as const }, createdAt: { gte: periodStart, lt: periodEnd } }
        : { status: { not: 'Refunded' as const } };

    const [sales, products, users] = await Promise.all([
      prisma.sale.findMany({
        where: saleWhere,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      // Low-stock count is a current inventory snapshot, not tied to the
      // selected period, so it's always computed from all products.
      prisma.product.findMany(),
      prisma.user.findMany({ select: { id: true, name: true, email: true } }),
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

    interface SellerAgg {
      sellerId: string | null;
      sellerName: string;
      totalOrders: number;
      totalRevenue: number;
    }
    const sellerAggMap = new Map<string, SellerAgg>();
    // Seed every registered user in, so sellers with zero sales still show
    // up in the summary table (not just whoever happens to have sold something).
    for (const u of users) {
      sellerAggMap.set(u.id, {
        sellerId: u.id,
        sellerName: u.name || u.email,
        totalOrders: 0,
        totalRevenue: 0,
      });
    }

    interface SellerSaleRow {
      saleId: string;
      date: string;
      sellerName: string;
      productName: string;
      category: string;
      quantity: number;
      amount: number;
    }
    const sellerSalesLog: SellerSaleRow[] = [];

    for (const sale of sales) {
      const day = sale.createdAt.toISOString().slice(0, 10);
      revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + sale.totalAmount);

      const sellerKey = sale.sellerId ?? sale.sellerName;
      const existingSeller = sellerAggMap.get(sellerKey);
      if (existingSeller) {
        existingSeller.totalOrders += 1;
        existingSeller.totalRevenue += sale.totalAmount;
      } else {
        // Sale from a user no longer in the User table (e.g. sellerName-only
        // legacy row) — still show them under the name that's on the sale.
        sellerAggMap.set(sellerKey, {
          sellerId: sale.sellerId,
          sellerName: sale.sellerName,
          totalOrders: 1,
          totalRevenue: sale.totalAmount,
        });
      }

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

        sellerSalesLog.push({
          saleId: sale.id,
          date: sale.createdAt.toISOString(),
          sellerName: sale.sellerName,
          productName: name,
          category,
          quantity: item.quantity,
          amount: Math.round(lineRevenue * 100) / 100,
        });
      }
    }

    const sellerSummary = [...sellerAggMap.values()]
      .map((s) => ({
        sellerId: s.sellerId,
        sellerName: s.sellerName,
        totalOrders: s.totalOrders,
        totalRevenue: Math.round(s.totalRevenue * 100) / 100,
        avgOrderValue:
          s.totalOrders > 0 ? Math.round((s.totalRevenue / s.totalOrders) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Detailed log stays newest-first and capped — the full unabridged
    // history is already available on the Sales page; this is a
    // per-seller/per-product breakdown view, not a replacement for it.
    const sellerSalesLogCapped = sellerSalesLog.slice(0, 200);

    const revenueByDay = [...revenueByDayMap.entries()]
      .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));
    // Only cap "All Time" — week/month are already naturally bounded to
    // at most ~31 days by the query itself.
    const revenueByDayTrimmed = range === 'all' ? revenueByDay.slice(-30) : revenueByDay;

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
        revenueByDay: revenueByDayTrimmed,
        revenueByCategory,
        topProducts,
        sellerSummary,
        sellerSalesLog: sellerSalesLogCapped,
        period: {
          range,
          anchor: anchor.toISOString(),
          label: periodLabel,
          start: periodStart ? periodStart.toISOString() : null,
          end: periodEnd ? periodEnd.toISOString() : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics.' }, { status: 500 });
  }
}