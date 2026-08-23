'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError('Something went wrong signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account.');
        return;
      }

      // Account created — sign in immediately.
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setNotice('Account created. Please sign in.');
        setMode('signin');
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError('Something went wrong creating your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EF] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full bg-[#8C4A5A] flex items-center justify-center text-white font-serif text-xl font-bold shadow-sm">
            BC
          </div>
          <div className="text-center">
            <h1 className="font-serif font-bold text-xl text-[#2B2627]">Beauty Cosmo</h1>
            <p className="text-[11px] text-[#8A8183] tracking-wide uppercase font-medium">
              Inventory &amp; POS
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#EAE1DA] p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex bg-[#FAF7EF] rounded-2xl p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setNotice('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'signin' ? 'bg-white shadow-sm text-[#8C4A5A]' : 'text-[#8A8183]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setNotice('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'signup' ? 'bg-white shadow-sm text-[#8C4A5A]' : 'text-[#8A8183]'
              }`}
            >
              Create Account
            </button>
          </div>

          {notice && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-xl text-[11px] font-medium">
              {notice}
            </div>
          )}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-xl text-[11px] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-3 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block text-[#8A8183] font-bold mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
                />
              </div>
            )}
            <div>
              <label className="block text-[#8A8183] font-bold mb-1">Email</label>
              <input
                required
                type="email"
                placeholder="you@shop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 focus:outline-none focus:border-[#8C4A5A]"
              />
            </div>
            <div>
              <label className="block text-[#8A8183] font-bold mb-1">Password</label>
              <div className="relative">
                <input
                  required
                  minLength={8}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF7EF] border border-[#EAE1DA] rounded-xl p-2.5 pr-9 focus:outline-none focus:border-[#8C4A5A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8183]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-[10px] text-[#8A8183] mt-1">Minimum 8 characters.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8C4A5A] hover:bg-[#733A48] disabled:opacity-60 text-white py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'signup' && (
            <p className="flex items-start gap-2 text-[10px] text-[#8A8183] bg-[#FAF7EF] rounded-xl p-3">
              <Sparkles size={13} className="shrink-0 mt-0.5 text-[#D4A373]" />
              The very first account created becomes the shop Admin automatically.
              Everyone after that signs up as a Seller and can be promoted later
              from Settings.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
