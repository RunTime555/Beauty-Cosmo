'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { useIsAdmin } from '@/lib/user-context';
import type { Product } from '@/lib/types';

const CATEGORIES = ['Skincare', 'Fragrance', 'Makeup', 'Cleanser'] as const;

const emptyForm = {
  name: '',
  category: 'Skincare' as (typeof CATEGORIES)[number],
  sku: '',
  costPrice: '',
  sellingPrice: '',
  stockQuantity: '',
};

export default function ProductsPage() {
  const isAdmin = useIsAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(emptyForm);

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

  useEffect(() => {
    // Fetching data on mount — not a state-sync effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      sku: product.sku,
      costPrice: String(product.costPrice),
      sellingPrice: String(product.sellingPrice),
      stockQuantity: String(product.stockQuantity),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        setForm(emptyForm);
        setEditingProduct(null);
        fetchProducts();
      } else {
        setFormError(data.error || 'Failed to save product.');
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setDeletingProduct(null);
        fetchProducts();
      } else {
        setDeleteError(data.error || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      setDeleteError('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  return (
    <div className="space-y-6">
      <Header
        title="Inventory Management"
        subtitle={
          isAdmin
            ? 'Live stock and pricing catalog. Add, edit, or remove products.'
            : 'Live stock and pricing catalog (view only).'
        }
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Filter by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#EAE1DA] rounded-2xl pl-4 pr-3 py-2 text-xs focus:outline-none focus:border-[#8C4A5A]"
          />
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-[#8C4A5A] hover:bg-[#733A48] text-white px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all shrink-0"
          >
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#8A8183]">Loading inventory...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-[#EAE1DA] text-xs text-[#8A8183]">
          {products.length === 0 ? 'No products yet.' : 'No products match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              variant="inventory"
              product={p}
              canManage={isAdmin}
              onEdit={openEditModal}
              onDelete={setDeletingProduct}
            />
          ))}
        </div>
      )}

      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#EAE1DA] max-w-md w-full p-6 space-y-4 shadow-xl my-8">
            <div className="flex justify-between items-center border-b border-[#FAF7EF] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#2B2627]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8A8183] hover:text-[#2B2627]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-xl text-[11px] font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
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
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as (typeof CATEGORIES)[number] })
                    }
                    className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
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
                    min="0"
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
                    min="0"
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
                    min="0"
                    step="1"
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
                  disabled={submitting}
                  className="px-4 py-2 bg-[#8C4A5A] text-white rounded-xl font-semibold hover:bg-[#733A48] disabled:opacity-60 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingProduct ? 'Save Changes' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingProduct && isAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#EAE1DA] max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif font-bold text-lg text-[#2B2627]">Delete Product?</h3>
            <p className="text-xs text-[#8A8183]">
              Are you sure you want to delete <span className="font-bold">{deletingProduct.name}</span>
              ? This cannot be undone.
            </p>
            {deleteError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-xl text-[11px] font-medium">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeletingProduct(null);
                  setDeleteError('');
                }}
                className="px-4 py-2 border border-[#EAE1DA] rounded-xl text-xs text-[#8A8183]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold disabled:opacity-60 flex items-center gap-2"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
