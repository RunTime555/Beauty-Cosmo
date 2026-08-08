'use client';

import React, { useEffect, useState } from 'react';
import { Search, Bell, HelpCircle, ArrowUpRight, Package, AlertTriangle, ShoppingBag, Trash2, CheckCircle2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  sellingPrice: number;
  stockQuantity: number;
  status: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerName: 'Sarah J.',
          totalAmount: total,
          taxAmount: tax,
          items: cart.map((c) => ({
            productId: c.product.id,
            quantity: c.quantity,
            price: c.product.sellingPrice,
          })),
        }),
      });

      if (res.ok) {
        setCart([]);
        setSuccessMessage('Sale processed successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
        fetchProducts();
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const lowStockCount = products.filter((p) => p.stockQuantity <= 5).length;
  const totalUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8183]" size={16} />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="w-full bg-[#F5EFEB] border border-[#EAE1DA] rounded-full pl-10 pr-4 py-2.5 text-xs text-[#2B2627] focus:outline-none focus:border-[#8C4A5A]"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button className="p-2 bg-[#F5EFEB] rounded-full text-[#8A8183] hover:text-[#2B2627]">
            <Bell size={18} />
          </button>
          <button className="p-2 bg-[#F5EFEB] rounded-full text-[#8A8183] hover:text-[#2B2627]">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

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
              <p className="font-serif text-2xl font-bold text-[#2B2627] mt-1">$1,240.00</p>
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
                {lowStockCount} <span className="text-xs font-normal text-[#8A8183]">items</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#2B2627]">POS Catalog</h2>
            {loading ? (
              <div className="py-12 text-center text-xs text-[#8A8183]">Loading PostgreSQL Inventory...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#EAE1DA] text-xs text-[#8A8183]">
                No products found. Add products in Inventory page.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-white p-4 rounded-3xl border border-[#EAE1DA] space-y-3 flex flex-col justify-between">
                    <div className="relative h-32 bg-[#FAF7EF] rounded-2xl flex items-center justify-center">
                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stockQuantity <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-white text-[#8C4A5A]'
                      }`}>
                        {p.stockQuantity} left
                      </span>
                      <ShoppingBag className="text-[#D4A373]" size={28} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#2B2627]">{p.name}</h3>
                      <p className="text-[10px] text-[#8A8183] uppercase font-bold">{p.category}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-serif font-bold text-sm">${p.sellingPrice.toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(p)}
                        disabled={p.stockQuantity === 0}
                        className="bg-[#8C4A5A] hover:bg-[#733A48] disabled:bg-gray-300 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                      >
                        {p.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#EAE1DA] space-y-4 sticky top-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-[#2B2627]">Sale Basket</h3>
              <span className="bg-[#F8ECEE] text-[#8C4A5A] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                {cart.reduce((a, b) => a + b.quantity, 0)} ITEMS
              </span>
            </div>

            <div className="space-y-3 pt-2 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-xs text-[#8A8183] text-center py-6">Basket is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center pb-2 border-b border-[#FAF7EF]">
                    <div>
                      <p className="text-xs font-bold text-[#2B2627]">{item.product.name}</p>
                      <p className="text-[10px] text-[#8A8183]">
                        Qty: {item.quantity} • ${item.product.sellingPrice.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-xs font-bold">
                        ${(item.product.sellingPrice * item.quantity).toFixed(2)}
                      </span>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-rose-600 hover:text-rose-800">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-1.5 pt-2 text-xs border-t border-[#EAE1DA]">
              <div className="flex justify-between text-[#8A8183]">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8A8183]">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-serif font-bold text-base text-[#2B2627] pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || processing}
              className="w-full bg-[#8C4A5A] hover:bg-[#733A48] disabled:bg-gray-300 text-white py-3 rounded-2xl text-xs font-bold transition-all"
            >
              {processing ? 'Processing...' : 'Complete Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}