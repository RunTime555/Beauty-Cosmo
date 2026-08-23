'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, HelpCircle, AlertTriangle } from 'lucide-react';

interface LowStockItem {
  id: string;
  name: string;
  stockQuantity: number;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  lowStockItems?: LowStockItem[];
}

export default function Header({
  title,
  subtitle,
  searchPlaceholder = 'Search products, orders...',
  onSearchChange,
  lowStockItems = [],
}: HeaderProps) {
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setShowHelp(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4 mb-6">
      {(title || subtitle) && (
        <div>
          {title && <h1 className="text-2xl font-serif font-bold text-[#2B2627]">{title}</h1>}
          {subtitle && <p className="text-xs text-[#8A8183]">{subtitle}</p>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {onSearchChange ? (
          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8183]"
              size={16}
            />
            <input
              type="text"
              value={search}
              placeholder={searchPlaceholder}
              onChange={(e) => {
                setSearch(e.target.value);
                onSearchChange(e.target.value);
              }}
              className="w-full bg-[#F5EFEB] border border-[#EAE1DA] rounded-full pl-10 pr-4 py-2.5 text-xs text-[#2B2627] focus:outline-none focus:border-[#8C4A5A]"
            />
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications((v) => !v);
                setShowHelp(false);
              }}
              className="relative p-2 bg-[#F5EFEB] rounded-full text-[#8A8183] hover:text-[#2B2627]"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {lowStockItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {lowStockItems.length > 9 ? '9+' : lowStockItems.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 max-w-[85vw] bg-white border border-[#EAE1DA] rounded-2xl shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b border-[#FAF7EF] font-serif font-bold text-xs text-[#2B2627]">
                  Low Stock Alerts
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {lowStockItems.length === 0 ? (
                    <p className="p-4 text-[11px] text-[#8A8183] text-center">
                      All products are well stocked.
                    </p>
                  ) : (
                    lowStockItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2.5 text-[11px] border-b border-[#FAF7EF] last:border-0"
                      >
                        <AlertTriangle size={13} className="text-[#8C4A5A] shrink-0" />
                        <span className="flex-1 text-[#2B2627] truncate">{item.name}</span>
                        <span className="font-bold text-rose-700">{item.stockQuantity} left</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={helpRef}>
            <button
              onClick={() => {
                setShowHelp((v) => !v);
                setShowNotifications(false);
              }}
              className="p-2 bg-[#F5EFEB] rounded-full text-[#8A8183] hover:text-[#2B2627]"
              aria-label="Help"
            >
              <HelpCircle size={18} />
            </button>
            {showHelp && (
              <div className="absolute right-0 mt-2 w-72 max-w-[85vw] bg-white border border-[#EAE1DA] rounded-2xl shadow-lg z-50 p-4 text-[11px] text-[#2B2627] space-y-2">
                <p className="font-serif font-bold text-xs">Quick Tips</p>
                <ul className="space-y-1.5 text-[#8A8183] list-disc pl-4">
                  <li>Add items to the basket on Dashboard, then Complete Checkout.</li>
                  <li>Products under 5 units are flagged Low Stock automatically.</li>
                  <li>Only Admins can edit products, view Analytics, or change Settings.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
