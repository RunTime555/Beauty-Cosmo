'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import SalesCart from '@/components/SalesCart';
import type { CartItem, Product, StoreSettings } from '@/lib/types';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'Beauty Cosmo Retail',
    taxRate: 8,
    currencySymbol: '$',
  });
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) setSettings(await res.json());
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const res = await fetch('/api/sales/stats');
      if (res.ok) {
        const data = await res.json();
        setTodayRevenue(data.todayRevenue ?? 0);
      }
    } catch (err) {
      console.error('Failed to load sales stats:', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchSettings(), fetchTodayStats()]);
    setLoading(false);
  };

  useEffect(() => {
    // Fetching data on mount — not a state-sync effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sidebar "New Sale" button links to /dashboard?new=1 so it does
  // something meaningful even when you're already on this page: start a
  // fresh transaction by clearing the current basket, then clean the URL.
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      // Reacting to an external signal (the URL), not syncing component
      // state to itself — this is the intended use of an effect here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCart([]);
      setCheckoutError('');
      setSuccessMessage('');
      router.replace('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const addToCart = (product: Product) => {
    setCheckoutError('');
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prevCart;
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const incrementItem = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.quantity < item.product.stockQuantity
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementItem = (productId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    setCheckoutError('');

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((c) => ({ productId: c.product.id, quantity: c.quantity })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCart([]);
        setSuccessMessage('Sale processed successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
        loadAll();
      } else {
        setCheckoutError(data.error || 'Checkout failed. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const lowStockItems = useMemo(
    () => products.filter((p) => p.stockQuantity <= 5),
    [products]
  );
  const totalUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);

  return (
    <div className="space-y-6">
      <Header
        onSearchChange={setSearch}
        searchPlaceholder="Search products, SKU, category..."
        lowStockItems={lowStockItems}
      />

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 size={16} /> {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#EAE1DA]">
              <div className="flex justify-between items-center text-[#8A8183]">
                <span className="text-[11px] font-bold uppercase">Today Sales</span>
                <ArrowUpRight size={16} />
              </div>
              <p className="font-serif text-2xl font-bold text-[#2B2627] mt-1">
                {settings.currencySymbol}
                {todayRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-[#EAE1DA]">
              <div className="flex justify-between items-center text-[#8A8183]">
                <span className="text-[11px] font-bold uppercase">Total Stock</span>
                <Package size={16} />
              </div>
              <p className="font-serif text-2xl font-bold text-[#2B2627] mt-1">
                {totalUnits} <span className="text-xs font-normal text-[#8A8183]">units</span>
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-[#EAE1DA]">
              <div className="flex justify-between items-center text-[#8A8183]">
                <span className="text-[11px] font-bold uppercase">Low Stock</span>
                <AlertTriangle size={16} className="text-[#8C4A5A]" />
              </div>
              <p className="font-serif text-2xl font-bold text-[#8C4A5A] mt-1">
                {lowStockItems.length} <span className="text-xs font-normal text-[#8A8183]">items</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#2B2627]">POS Catalog</h2>
            {loading ? (
              <div className="py-12 text-center text-xs text-[#8A8183]">Loading inventory...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#EAE1DA] text-xs text-[#8A8183]">
                {products.length === 0
                  ? 'No products found. Add products in the Inventory page.'
                  : 'No products match your search.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} variant="pos" product={p} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <SalesCart
            cart={cart}
            taxRate={settings.taxRate}
            currencySymbol={settings.currencySymbol}
            processing={processing}
            error={checkoutError}
            onIncrement={incrementItem}
            onDecrement={decrementItem}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}