'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import Header from '@/components/Header';
import type { AnalyticsSummary } from '@/lib/types';

type RangeType = 'all' | 'week' | 'month';

const EMPTY: AnalyticsSummary = {
  totalRevenue: 0,
  totalGrossProfit: 0,
  totalOrders: 0,
  avgOrderValue: 0,
  lowStockCount: 0,
  revenueByDay: [],
  revenueByCategory: [],
  topProducts: [],
  sellerSummary: [],
  sellerSalesLog: [],
  period: { range: 'all', anchor: new Date().toISOString(), label: 'All Time', start: null, end: null },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sellerLogSearch, setSellerLogSearch] = useState('');
  const [range, setRange] = useState<RangeType>('all');
  const [anchor, setAnchor] = useState(() => new Date());

  const loadAnalytics = useCallback(async (r: RangeType, a: Date) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ range: r, anchor: a.toISOString() });
      const res = await fetch(`/api/analytics?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load analytics.');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reacting to the range/anchor filters changing — not a state-sync effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAnalytics(range, anchor);
  }, [range, anchor, loadAnalytics]);

  const goToPrevious = () => {
    setAnchor((prev) => {
      const next = new Date(prev);
      if (range === 'week') next.setDate(next.getDate() - 7);
      if (range === 'month') next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const goToNext = () => {
    setAnchor((prev) => {
      const next = new Date(prev);
      if (range === 'week') next.setDate(next.getDate() + 7);
      if (range === 'month') next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const goToCurrent = () => setAnchor(new Date());

  // Disable "Next" once the period would move into the future.
  const isNextDisabled = useMemo(() => {
    if (range === 'all') return true;
    const now = new Date();
    const probe = new Date(anchor);
    if (range === 'week') probe.setDate(probe.getDate() + 7);
    if (range === 'month') probe.setMonth(probe.getMonth() + 1);
    return probe > now && data.period.range === range;
  }, [range, anchor, data.period.range]);

  const filteredSellerLog = useMemo(() => {
    const q = sellerLogSearch.trim().toLowerCase();
    if (!q) return data.sellerSalesLog;
    return data.sellerSalesLog.filter(
      (row) =>
        row.sellerName.toLowerCase().includes(q) ||
        row.productName.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q)
    );
  }, [data.sellerSalesLog, sellerLogSearch]);

  return (
    <div className="space-y-6">
      <Header
        title="Analytics & Insights"
        subtitle="Track operational metrics, revenue breakdowns, and performance."
      />

      <div className="bg-white p-4 rounded-3xl border border-[#EAE1DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-[#FAF7EF] rounded-2xl p-1 text-xs font-bold w-full sm:w-auto">
          {(['all', 'week', 'month'] as RangeType[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRange(r);
                setAnchor(new Date());
              }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
                range === r ? 'bg-white shadow-sm text-[#8C4A5A]' : 'text-[#8A8183]'
              }`}
            >
              {r === 'all' ? 'All Time' : r === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        {range !== 'all' && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={goToPrevious}
              aria-label="Previous period"
              className="w-8 h-8 rounded-full bg-[#FAF7EF] hover:bg-[#F0E7DF] flex items-center justify-center text-[#2B2627]"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={goToCurrent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7EF] hover:bg-[#F0E7DF] text-[#2B2627] font-semibold min-w-[150px] justify-center"
            >
              <Calendar size={12} />
              {data.period.label}
            </button>
            <button
              onClick={goToNext}
              disabled={isNextDisabled}
              aria-label="Next period"
              className="w-8 h-8 rounded-full bg-[#FAF7EF] hover:bg-[#F0E7DF] disabled:opacity-40 flex items-center justify-center text-[#2B2627]"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl text-xs font-medium">
          {error}
        </div>
      )}


      {loading ? (
        <div className="py-12 text-center text-xs text-[#8A8183]">Crunching the numbers...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#EAE1DA] space-y-2">
              <div className="flex justify-between text-[#8A8183]">
                <span className="text-[10px] font-bold uppercase">Total Gross Profit</span>
                <DollarSign size={16} />
              </div>
              <p className="font-serif text-2xl font-bold text-[#2B2627]">
                ${data.totalGrossProfit.toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#EAE1DA] space-y-2">
              <div className="flex justify-between text-[#8A8183]">
                <span className="text-[10px] font-bold uppercase">Total Orders</span>
                <ShoppingCart size={16} />
              </div>
              <p className="font-serif text-2xl font-bold text-[#2B2627]">{data.totalOrders}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#EAE1DA] space-y-2">
              <div className="flex justify-between text-[#8A8183]">
                <span className="text-[10px] font-bold uppercase">Avg. Order Value</span>
                <TrendingUp size={16} />
              </div>
              <p className="font-serif text-2xl font-bold text-[#2B2627]">
                ${data.avgOrderValue.toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#EAE1DA] space-y-2">
              <div className="flex justify-between text-[#8A8183]">
                <span className="text-[10px] font-bold uppercase">Low Stock Items</span>
                <Package size={16} className="text-[#8C4A5A]" />
              </div>
              <p className="font-serif text-2xl font-bold text-[#8C4A5A]">{data.lowStockCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE1DA]">
              <h3 className="font-serif font-bold text-sm text-[#2B2627] mb-4">
                Revenue {data.period.range === 'all' ? '(Last 30 Days)' : `— ${data.period.label}`}
              </h3>
              {data.revenueByDay.length === 0 ? (
                <p className="text-xs text-[#8A8183] text-center py-10">No sales yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAE1DA" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                      contentStyle={{ fontSize: 11, borderRadius: 12, borderColor: '#EAE1DA' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8C4A5A"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE1DA]">
              <h3 className="font-serif font-bold text-sm text-[#2B2627] mb-4">Revenue by Category</h3>
              {data.revenueByCategory.length === 0 ? (
                <p className="text-xs text-[#8A8183] text-center py-10">No sales yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.revenueByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAE1DA" />
                    <XAxis dataKey="category" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                      contentStyle={{ fontSize: 11, borderRadius: 12, borderColor: '#EAE1DA' }}
                    />
                    <Bar dataKey="revenue" fill="#D4A373" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#EAE1DA] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#FAF7EF]">
              <h3 className="font-serif font-bold text-sm text-[#2B2627]">Top Products</h3>
            </div>
            {data.topProducts.length === 0 ? (
              <p className="text-xs text-[#8A8183] text-center py-10">No sales yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[420px]">
                  <thead>
                    <tr className="bg-[#FAF7EF] text-[10px] font-bold text-[#8A8183] uppercase">
                      <th className="p-4 pl-6">Product</th>
                      <th className="p-4">Units Sold</th>
                      <th className="p-4 pr-6">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF7EF] text-xs">
                    {data.topProducts.map((p) => (
                      <tr key={p.name}>
                        <td className="p-4 pl-6 font-bold text-[#2B2627]">{p.name}</td>
                        <td className="p-4 text-[#8A8183]">{p.unitsSold}</td>
                        <td className="p-4 pr-6 font-serif font-bold text-[#2B2627]">
                          ${p.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-[#EAE1DA] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#FAF7EF] flex items-center gap-2">
              <Users size={16} className="text-[#8C4A5A]" />
              <h3 className="font-serif font-bold text-sm text-[#2B2627]">Sales by Seller</h3>
            </div>
            {data.sellerSummary.length === 0 ? (
              <p className="text-xs text-[#8A8183] text-center py-10">No sellers registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[520px]">
                  <thead>
                    <tr className="bg-[#FAF7EF] text-[10px] font-bold text-[#8A8183] uppercase">
                      <th className="p-4 pl-6">Seller</th>
                      <th className="p-4">Orders</th>
                      <th className="p-4">Avg. Order</th>
                      <th className="p-4 pr-6">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF7EF] text-xs">
                    {data.sellerSummary.map((s) => (
                      <tr key={s.sellerId ?? s.sellerName}>
                        <td className="p-4 pl-6 font-bold text-[#2B2627]">{s.sellerName}</td>
                        <td className="p-4 text-[#8A8183]">{s.totalOrders}</td>
                        <td className="p-4 text-[#8A8183]">${s.avgOrderValue.toFixed(2)}</td>
                        <td className="p-4 pr-6 font-serif font-bold text-[#2B2627]">
                          ${s.totalRevenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-[#EAE1DA] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#FAF7EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-serif font-bold text-sm text-[#2B2627]">Seller Sales Log</h3>
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8183]"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Filter by seller or product..."
                  value={sellerLogSearch}
                  onChange={(e) => setSellerLogSearch(e.target.value)}
                  className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-full pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#8C4A5A]"
                />
              </div>
            </div>
            {data.sellerSalesLog.length === 0 ? (
              <p className="text-xs text-[#8A8183] text-center py-10">No sales yet.</p>
            ) : filteredSellerLog.length === 0 ? (
              <p className="text-xs text-[#8A8183] text-center py-10">No matching sales.</p>
            ) : (
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead className="sticky top-0 bg-[#FAF7EF] z-10">
                    <tr className="text-[10px] font-bold text-[#8A8183] uppercase">
                      <th className="p-4 pl-6">Date</th>
                      <th className="p-4">Seller</th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Qty</th>
                      <th className="p-4 pr-6">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF7EF] text-xs">
                    {filteredSellerLog.map((row, idx) => (
                      <tr key={`${row.saleId}-${idx}`}>
                        <td className="p-4 pl-6 text-[#8A8183] whitespace-nowrap">
                          {new Date(row.date).toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-[#2B2627] whitespace-nowrap">
                          {row.sellerName}
                        </td>
                        <td className="p-4 text-[#2B2627] whitespace-nowrap">{row.productName}</td>
                        <td className="p-4 text-[#8A8183] whitespace-nowrap">{row.category}</td>
                        <td className="p-4 text-[#8A8183]">{row.quantity}</td>
                        <td className="p-4 pr-6 font-serif font-bold text-[#2B2627] whitespace-nowrap">
                          ${row.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {data.sellerSalesLog.length >= 200 && (
              <p className="px-6 pb-4 text-[10px] text-[#8A8183]">
                Showing the most recent 200 line items. See the Sales page for the full history.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}