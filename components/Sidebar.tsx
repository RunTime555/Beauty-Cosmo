'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  Plus,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useUser } from '@/lib/user-context';
import { createClient } from '@/lib/supabase/client';
import type { Role } from '@/lib/types';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SELLER'] },
  { name: 'Products', href: '/products', icon: Package, roles: ['ADMIN', 'SELLER'] },
  { name: 'Sales', href: '/sales', icon: ShoppingBag, roles: ['ADMIN', 'SELLER'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['ADMIN'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] },
];

function initialsFor(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const visibleNav = navigation.filter((item) => item.roles.includes(user.role));

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#F5EFEB] border-b border-[#EAE1DA] px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#8C4A5A] flex items-center justify-center text-white font-serif text-sm font-bold">
            BC
          </div>
          <span className="font-serif font-bold text-[#2B2627]">Beauty Cosmo</span>
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
      <aside
        className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 max-w-[80vw] bg-[#F5EFEB] border-r border-[#EAE1DA] p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="space-y-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8C4A5A] flex items-center justify-center text-white font-serif text-base font-bold shadow-sm">
              BC
            </div>
            <div>
              <h1 className="font-serif font-bold text-base text-[#2B2627]">Beauty Cosmo</h1>
              <p className="text-[10px] text-[#8A8183] tracking-wider uppercase font-medium">
                {user.role === 'ADMIN' ? 'Admin' : 'Seller'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all
                    ${
                      isActive
                        ? 'bg-[#8C4A5A] text-white shadow-sm'
                        : 'text-[#8A8183] hover:text-[#2B2627] hover:bg-[#FAF7EF]'
                    }
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
          <Link
            href="/dashboard?new=1"
            onClick={() => setIsOpen(false)}
            className="w-full bg-[#8C4A5A] hover:bg-[#733A48] text-white py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>New Sale</span>
          </Link>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-9 h-9 rounded-full bg-[#D4A373] flex items-center justify-center text-white font-bold text-xs shrink-0">
              {initialsFor(user.name, user.email)}
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="text-xs font-bold text-[#2B2627] truncate">
                {user.name || user.email}
              </p>
              <p className="text-[10px] text-[#8A8183] capitalize">{user.role.toLowerCase()}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              title="Sign out"
              aria-label="Sign out"
              className="p-2 text-[#8A8183] hover:text-[#8C4A5A] hover:bg-[#FAF7EF] rounded-xl transition-colors disabled:opacity-50 shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}