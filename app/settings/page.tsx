'use client';

import React from 'react';
import { Store, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#2B2627]">Shop Settings</h1>
        <p className="text-xs text-[#8A8183]">Configure store profile, currency, taxes, and system roles.</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EAE1DA] p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#FAF7EF] pb-4">
          <Store className="text-[#8C4A5A]" size={20} />
          <div>
            <h2 className="font-serif font-bold text-base text-[#2B2627]">Store Identity</h2>
            <p className="text-[10px] text-[#8A8183]">Main info visible on receipts and invoices.</p>
          </div>
        </div>

        <form className="space-y-4 text-xs">
          <div>
            <label className="block text-[#8A8183] font-bold mb-1">Store Name</label>
            <input
              type="text"
              defaultValue="Beauty Cosmo Retail"
              className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8A8183] font-bold mb-1">Default Tax Rate (%)</label>
              <input
                type="number"
                defaultValue="8.0"
                className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
              />
            </div>
            <div>
              <label className="block text-[#8A8183] font-bold mb-1">Currency Symbol</label>
              <input
                type="text"
                defaultValue="$ (USD)"
                className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
              />
            </div>
          </div>

          <button
            type="button"
            className="bg-[#8C4A5A] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#733A48]"
          >
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
}