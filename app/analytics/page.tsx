'use client';

import React from 'react';
import { TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#2B2627]">Analytics & Insights</h1>
        <p className="text-xs text-[#8A8183]">Track operational metrics, revenue breakdowns, and performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#EAE1DA] space-y-2">
          <div className="flex justify-between text-[#8A8183]">
            <span className="text-[10px] font-bold uppercase">Total Gross Profit</span>
            <DollarSign size={16} />
          </div>
          <p className="font-serif text-2xl font-bold text-[#2B2627]">$18,420.00</p>
          <p className="text-[10px] text-emerald-600 font-bold">+12.5% from last month</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EAE1DA] space-y-2">
          <div className="flex justify-between text-[#8A8183]">
            <span className="text-[10px] font-bold uppercase">Total Orders</span>
            <ShoppingCart size={16} />
          </div>
          <p className="font-serif text-2xl font-bold text-[#2B2627]">384</p>
          <p className="text-[10px] text-emerald-600 font-bold">+8.2% from last month</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EAE1DA] space-y-2">
          <div className="flex justify-between text-[#8A8183]">
            <span className="text-[10px] font-bold uppercase">Avg. Order Value</span>
            <TrendingUp size={16} />
          </div>
          <p className="font-serif text-2xl font-bold text-[#2B2627]">$47.96</p>
          <p className="text-[10px] text-emerald-600 font-bold">+3.1% from last month</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EAE1DA] space-y-2">
          <div className="flex justify-between text-[#8A8183]">
            <span className="text-[10px] font-bold uppercase">Active Customers</span>
            <Users size={16} />
          </div>
          <p className="font-serif text-2xl font-bold text-[#2B2627]">1,204</p>
          <p className="text-[10px] text-emerald-600 font-bold">+15.4% growth</p>
        </div>
      </div>
    </div>
  );
}