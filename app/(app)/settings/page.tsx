'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import { useUser } from '@/lib/user-context';
import type { AppUser, StoreSettings } from '@/lib/types';

export default function SettingsPage() {
  const currentUser = useUser();

  const [settings, setSettings] = useState<StoreSettings>({
    storeName: '',
    taxRate: 8,
    currencySymbol: '$',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  const [users, setUsers] = useState<AppUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  const [roleError, setRoleError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to load settings:', err))
      .finally(() => setLoading(false));

    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch((err) => console.error('Failed to load team:', err))
      .finally(() => setUsersLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setSaveError(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, role: 'ADMIN' | 'SELLER') => {
    setRoleUpdating(userId);
    setRoleError('');
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      } else {
        setRoleError(data.error || 'Failed to update role.');
      }
    } catch (err) {
      console.error('Failed to update role:', err);
      setRoleError('Network error. Please try again.');
    } finally {
      setRoleUpdating(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Header title="Settings" subtitle="Manage your store preferences and team access." />

      <form
        onSubmit={handleSave}
        className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE1DA] space-y-4"
      >
        <h2 className="font-serif font-bold text-base text-[#2B2627]">Store Preferences</h2>

        {loading ? (
          <p className="text-xs text-[#8A8183]">Loading settings...</p>
        ) : (
          <>
            {saveError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-xl text-[11px] font-medium">
                {saveError}
              </div>
            )}
            {saved && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-[11px] font-medium flex items-center gap-2">
                <CheckCircle2 size={14} /> Preferences saved.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[#8A8183] font-bold mb-1">Store Name</label>
                <input
                  required
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
                />
              </div>
              <div>
                <label className="block text-[#8A8183] font-bold mb-1">Currency Symbol</label>
                <input
                  required
                  type="text"
                  maxLength={3}
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
                />
              </div>
              <div>
                <label className="block text-[#8A8183] font-bold mb-1">Tax Rate (%)</label>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) =>
                    setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#8C4A5A] hover:bg-[#733A48] disabled:opacity-60 text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Preferences
              </button>
            </div>
          </>
        )}
      </form>

      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE1DA] space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#8C4A5A]" />
          <h2 className="font-serif font-bold text-base text-[#2B2627]">Team &amp; Roles</h2>
        </div>
        <p className="text-[11px] text-[#8A8183]">
          Admins can manage products, view analytics, and change store settings. Sellers can only
          process sales and view inventory/history.
        </p>

        {roleError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-xl text-[11px] font-medium">
            {roleError}
          </div>
        )}

        {usersLoading ? (
          <p className="text-xs text-[#8A8183]">Loading team...</p>
        ) : users.length === 0 ? (
          <p className="text-xs text-[#8A8183]">No team members found.</p>
        ) : (
          <div className="divide-y divide-[#FAF7EF]">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2B2627] truncate">{u.name || u.email}</p>
                  <p className="text-[10px] text-[#8A8183] truncate">{u.email}</p>
                </div>
                <select
                  value={u.role}
                  disabled={roleUpdating === u.id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value as 'ADMIN' | 'SELLER')}
                  className="bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2627] disabled:opacity-60 self-start sm:self-auto"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SELLER">Seller</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-[#8A8183]">
        Signed in as <span className="font-bold">{currentUser.email}</span> (
        {currentUser.role.toLowerCase()}).
      </p>
    </div>
  );
}
