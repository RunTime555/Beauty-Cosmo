'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, Package, DollarSign, ShoppingCart } from 'lucide-react';
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

const EMPTY: AnalyticsSummary = {
  totalRevenue: 0,
  totalGrossProfit: 0,
  totalOrders: 0,
  avgOrderValue: 0,
  lowStockCount: 0,
  revenueByDay: [],
  revenueByCategory: [],
  topProducts: [],
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load analytics.');
        setData(json);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Header
        title="Analytics & Insights"
        subtitle="Track operational metrics, revenue breakdowns, and performance."
      />

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
              <h3 className="font-serif font-bold text-sm text-[#2B2627] mb-4">Revenue (Last 30 Days)</h3>
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
        </>
      )}
    </div>
  );
}
