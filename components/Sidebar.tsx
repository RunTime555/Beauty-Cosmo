'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Plus, 
  Menu, 
  X 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Sales', href: '/sales', icon: ShoppingBag },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#F5EFEB] border-b border-[#EAE1DA] px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#8C4A5A] flex items-center justify-center text-white font-serif text-sm font-bold">
            BC
          </div>
          <span className="font-serif font-bold text-[#2B2627]">Beatty Cosmo</span>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-[#2B2627] hover:bg-[#EAE1DA] rounded-xl transition-colors"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#F5EFEB] border-r border-[#EAE1DA] p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8C4A5A] flex items-center justify-center text-white font-serif text-base font-bold shadow-sm">
              BC
            </div>
            <div>
              <h1 className="font-serif font-bold text-base text-[#2B2627]">Beatty Cosmo</h1>
              <p className="text-[10px] text-[#8A8183] tracking-wider uppercase font-medium">Luxury Admin</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all
                    ${isActive 
                      ? 'bg-[#8C4A5A] text-white shadow-sm' 
                      : 'text-[#8A8183] hover:text-[#2B2627] hover:bg-[#FAF7EF]'}
                  `}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Button & User Info */}
        <div className="space-y-4 pt-4 border-t border-[#EAE1DA]">
          <button className="w-full bg-[#8C4A5A] hover:bg-[#733A48] text-white py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]">
            <Plus size={16} />
            <span>New Sale</span>
          </button>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-9 h-9 rounded-full bg-[#D4A373] flex items-center justify-center text-white font-bold text-xs">
              SJ
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#2B2627]">Sarah J.</p>
              <p className="text-[10px] text-[#8A8183]">Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}