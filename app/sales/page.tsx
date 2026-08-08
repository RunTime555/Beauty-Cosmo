'use client';

import React, { useEffect, useState } from 'react';

interface SaleItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; sku: string };
}

interface Sale {
  id: string;
  sellerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: SaleItem[];
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sales')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSales(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#2B2627]">Sales History</h1>
        <p className="text-xs text-[#8A8183]">Real-time transaction logs directly from PostgreSQL.</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EAE1DA] overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-[#FAF7EF]">
          <h2 className="font-serif font-bold text-base text-[#2B2627]">Transactions Log</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#8A8183]">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#FAF7EF] text-[10px] font-bold text-[#8A8183] uppercase border-b border-[#EAE1DA]">
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4 pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF7EF] text-xs">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#FAF7EF]/50">
                    <td className="p-4 pl-6 font-bold text-[#2B2627]">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {sale.items.map((i) => (
                        <div key={i.id} className="text-[11px] text-[#2B2627]">
                          {i.product?.name} (x{i.quantity})
                        </div>
                      ))}
                    </td>
                    <td className="p-4 text-[#2B2627] font-medium">{sale.sellerName}</td>
                    <td className="p-4 font-serif font-bold text-[#2B2627]">
                      ${sale.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4 pr-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}