'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit3, X, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: 'Skincare',
    sku: '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setForm({ name: '', category: 'Skincare', sku: '', costPrice: '', sellingPrice: '', stockQuantity: '' });
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to create product:', err);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2B2627]">Inventory Management</h1>
          <p className="text-xs text-[#8A8183]">Live stock and pricing catalog stored in PostgreSQL.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#8C4A5A] hover:bg-[#733A48] text-white px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8183]" size={14} />
        <input
          type="text"
          placeholder="Filter by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-[#EAE1DA] rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#8C4A5A]"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#8A8183]">Connecting to PostgreSQL...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-3xl border border-[#EAE1DA] space-y-3 relative flex flex-col justify-between">
              <span className={`absolute top-6 right-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                p.status === 'Low_Stock' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {p.status.replace('_', ' ')}
              </span>
              <div className="h-36 bg-[#FAF7EF] rounded-2xl flex items-center justify-center text-xs text-[#8A8183]">
                {p.sku}
              </div>
              <div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-[#8A8183] font-bold uppercase">{p.category}</span>
                  <span className="font-serif font-bold text-sm text-[#2B2627]">${p.sellingPrice.toFixed(2)}</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-[#2B2627]">{p.name}</h3>
                <p className="text-[11px] text-[#8A8183] mt-1">{p.stockQuantity} Units Remaining</p>
              </div>
              <button className="w-full py-2 bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl text-xs font-semibold text-[#2B2627] flex items-center justify-center gap-1.5 hover:bg-[#F5EFEB]">
                <Edit3 size={14} /> Edit Product
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#EAE1DA] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#FAF7EF] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#2B2627]">Add New Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8A8183] hover:text-[#2B2627]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8A8183] font-bold mb-1">Product Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Velvet Rose Lipstick"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8A8183] font-bold mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
                  >
                    <option value="Skincare">Skincare</option>
                    <option value="Fragrance">Fragrance</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Cleanser">Cleanser</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8A8183] font-bold mb-1">SKU Code</label>
                  <input
                    required
                    type="text"
                    placeholder="BC-SKU-101"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#8A8183] font-bold mb-1">Cost ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="12.00"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
                  />
                </div>
                <div>
                  <label className="block text-[#8A8183] font-bold mb-1">Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="42.00"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
                  />
                </div>
                <div>
                  <label className="block text-[#8A8183] font-bold mb-1">Quantity</label>
                  <input
                    required
                    type="number"
                    placeholder="50"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#EAE1DA] rounded-xl text-[#8A8183]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8C4A5A] text-white rounded-xl font-semibold hover:bg-[#733A48]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}