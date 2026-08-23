'use client';

import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import type { CartItem } from '@/lib/types';

interface SalesCartProps {
  cart: CartItem[];
  taxRate: number;
  currencySymbol: string;
  processing: boolean;
  error?: string;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export default function SalesCart({
  cart,
  taxRate,
  currencySymbol,
  processing,
  error,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}: SalesCartProps) {
  const subtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#EAE1DA] space-y-4 lg:sticky lg:top-6">
      <div className="flex justify-between items-center">
        <h3 className="font-serif font-bold text-lg text-[#2B2627]">Sale Basket</h3>
        <span className="bg-[#F8ECEE] text-[#8C4A5A] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
          {totalItems} ITEMS
        </span>
      </div>

      <div className="space-y-3 pt-2 max-h-64 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="text-xs text-[#8A8183] text-center py-6">Basket is empty</p>
        ) : (
          cart.map((item) => (
            <div
              key={item.product.id}
              className="flex justify-between items-center gap-2 pb-2 border-b border-[#FAF7EF]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#2B2627] truncate">{item.product.name}</p>
                <p className="text-[10px] text-[#8A8183]">
                  {currencySymbol}
                  {item.product.sellingPrice.toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onDecrement(item.product.id)}
                  aria-label={`Decrease ${item.product.name} quantity`}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#FAF7EF] text-[#8A8183] hover:text-[#2B2627]"
                >
                  <Minus size={12} />
                </button>
                <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => onIncrement(item.product.id)}
                  disabled={item.quantity >= item.product.stockQuantity}
                  aria-label={`Increase ${item.product.name} quantity`}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#FAF7EF] text-[#8A8183] hover:text-[#2B2627] disabled:opacity-40"
                >
                  <Plus size={12} />
                </button>
              </div>
              <span className="font-serif text-xs font-bold w-14 text-right shrink-0">
                {currencySymbol}
                {(item.product.sellingPrice * item.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => onRemove(item.product.id)}
                aria-label={`Remove ${item.product.name}`}
                className="text-rose-600 hover:text-rose-800 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-1.5 pt-2 text-xs border-t border-[#EAE1DA]">
        <div className="flex justify-between text-[#8A8183]">
          <span>Subtotal</span>
          <span>
            {currencySymbol}
            {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-[#8A8183]">
          <span>Tax ({taxRate}%)</span>
          <span>
            {currencySymbol}
            {tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between font-serif font-bold text-base text-[#2B2627] pt-2">
          <span>Total</span>
          <span>
            {currencySymbol}
            {total.toFixed(2)}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-xl text-[11px] font-medium">
          {error}
        </div>
      )}

      <button
        onClick={onCheckout}
        disabled={cart.length === 0 || processing}
        className="w-full bg-[#8C4A5A] hover:bg-[#733A48] disabled:bg-gray-300 text-white py-3 rounded-2xl text-xs font-bold transition-all"
      >
        {processing ? 'Processing...' : 'Complete Checkout'}
      </button>
    </div>
  );
}
