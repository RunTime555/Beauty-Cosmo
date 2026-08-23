'use client';

import React from 'react';
import { ShoppingBag, Edit3, Trash2 } from 'lucide-react';
import type { Product } from '@/lib/types';

interface PosCardProps {
  variant: 'pos';
  product: Product;
  onAddToCart: (product: Product) => void;
}

interface InventoryCardProps {
  variant: 'inventory';
  product: Product;
  canManage: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

type ProductCardProps = PosCardProps | InventoryCardProps;

export default function ProductCard(props: ProductCardProps) {
  const { product } = props;

  if (props.variant === 'pos') {
    const outOfStock = product.stockQuantity === 0;
    return (
      <div className="bg-white p-4 rounded-3xl border border-[#EAE1DA] space-y-3 flex flex-col justify-between">
        <div className="relative h-32 bg-[#FAF7EF] rounded-2xl flex items-center justify-center">
          <span
            className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              product.stockQuantity <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-white text-[#8C4A5A]'
            }`}
          >
            {product.stockQuantity} left
          </span>
          <ShoppingBag className="text-[#D4A373]" size={28} />
        </div>
        <div>
          <h3 className="font-serif font-bold text-sm text-[#2B2627]">{product.name}</h3>
          <p className="text-[10px] text-[#8A8183] uppercase font-bold">{product.category}</p>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-serif font-bold text-sm">${product.sellingPrice.toFixed(2)}</span>
          <button
            onClick={() => props.onAddToCart(product)}
            disabled={outOfStock}
            className="bg-[#8C4A5A] hover:bg-[#733A48] disabled:bg-gray-300 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    );
  }

  const { canManage, onEdit, onDelete } = props;

  return (
    <div className="bg-white p-4 rounded-3xl border border-[#EAE1DA] space-y-3 relative flex flex-col justify-between">
      <span
        className={`absolute top-6 right-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
          product.status === 'Low_Stock'
            ? 'bg-rose-100 text-rose-800'
            : product.status === 'Pre_Order'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-emerald-100 text-emerald-800'
        }`}
      >
        {product.status.replace('_', ' ')}
      </span>
      <div className="h-36 bg-[#FAF7EF] rounded-2xl flex items-center justify-center text-xs text-[#8A8183]">
        {product.sku}
      </div>
      <div>
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] text-[#8A8183] font-bold uppercase">{product.category}</span>
          <span className="font-serif font-bold text-sm text-[#2B2627]">
            ${product.sellingPrice.toFixed(2)}
          </span>
        </div>
        <h3 className="font-serif font-bold text-sm text-[#2B2627]">{product.name}</h3>
        <p className="text-[11px] text-[#8A8183] mt-1">{product.stockQuantity} Units Remaining</p>
      </div>
      {canManage ? (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 py-2 bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl text-xs font-semibold text-[#2B2627] flex items-center justify-center gap-1.5 hover:bg-[#F5EFEB]"
          >
            <Edit3 size={14} /> Edit
          </button>
          <button
            onClick={() => onDelete(product)}
            aria-label={`Delete ${product.name}`}
            className="py-2 px-3 bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <div className="py-2 text-center text-[10px] text-[#8A8183] uppercase font-bold tracking-wide">
          View only
        </div>
      )}
    </div>
  );
}
