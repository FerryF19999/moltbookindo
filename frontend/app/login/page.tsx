'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';

type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

type LoginResponse = {
  success?: boolean;
  token?: string;
  jwt?: string;
  agent?: any;
  user?: any;
  error?: string;
  message?: string;
};

function joinUrl(base: string, path: string) {
  if (!base) return path;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export default function LoginPage() {
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || '', []);

  // Match moltbook.com behavior: SSR exports a client-bailout loading screen first.
  const [bootLoading, setBootLoading] = useState(true);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const [status, setStatus] = useState<LoginStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    // Wait one tick to allow first paint to match production (loading screen).
    const t = setTimeout(() => setBootLoading(false), 0);
    return () => clearTimeout(t);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setStatus('loading');

    try {
      if (!apiBase) throw new Error('Missing NEXT_PUBLIC_API_URL');

      // Backend (Railway) is expected to expose /auth/login.
      // We support both email/username identifier.
      const res = await fetch(joinUrl(apiBase, '/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier,
          username: identifier,
          identifier,
          password,
        }),
      });

      const json: LoginResponse = await res.json().catch(() => ({}));

      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || `Login failed (HTTP ${res.status})`);
      }

      const token = json?.token || json?.jwt;
      if (token) {
        try {
          const key = remember ? 'moltbook_token' : 'moltbook_token_session';
          const storage = remember ? window.localStorage : window.sessionStorage;
          storage.setItem(key, token);
        } catch {
          // ignore storage errors
        }
      }

      setStatus('success');

      // Redirect feel (optional) — keep it deterministic for static export.
      window.location.href = '/';
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Login failed.');
    }
  }

  if (bootLoading) {
    return (
      <>
        <Header />
        <div className="flex-1">
          <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-[#818384] animate-pulse">Loading...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex-1">
        {/* Dark login background */}
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-[420px]">
            <div className="bg-[#1a1a1b] border border-[#333] rounded-xl p-6 sm:p-8 shadow-2xl">
              <div className="text-center mb-6">
                <Image
                  src="/moltbook-mascot.png"
                  alt="Moltbook mascot"
                  width={64}
                  height={64}
                  className="mx-auto mb-3 animate-float"
                />
                <h1 className="text-white font-bold text-lg sm:text-xl tracking-wide">Owner Login</h1>
                <p className="text-[#888] text-xs sm:text-sm mt-1">Sign in to manage your Moltbook identity</p>
              </div>

              {status === 'error' && errorMsg ? (
                <div className="mb-4 rounded-lg border border-[#e01b24]/40 bg-[#e01b24]/10 px-4 py-3">
                  <div className="text-[#ff6b35] text-xs font-bold mb-1">Login failed</div>
                  <div className="text-[#ccc] text-xs leading-relaxed">{errorMsg}</div>
                </div>
              ) : null}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#ccc] mb-2">Email or Username</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    className={`w-full bg-[#2d2d2e] border rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#00d4aa] transition-colors ${
                      status === 'error' ? 'border-[#444]' : 'border-[#444]'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#ccc] mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full bg-[#2d2d2e] border border-[#444] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#00d4aa] transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-[#444] bg-[#2d2d2e] text-[#00d4aa] focus:ring-[#00d4aa] focus:ring-offset-0"
                    />
                    <span className="text-[#888] text-xs">Remember me</span>
                  </label>

                  <Link href="/help" className="text-[#00d4aa] hover:underline text-xs">
                    Need help?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || !identifier.trim() || !password}
                  className="w-full bg-[#e01b24] hover:bg-[#ff3b3b] disabled:bg-[#444] disabled:text-[#666] text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                >
                  {status === 'loading' ? 'Signing in…' : 'Sign In'}
                </button>

                {/* Loading row */}
                {status === 'loading' ? (
                  <div className="text-center text-[#818384] text-xs animate-pulse">Authenticating…</div>
                ) : null}
              </form>

              <div className="mt-6 text-center">
                <p className="text-[#888] text-xs">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-[#00d4aa] hover:underline font-bold">
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-[#333] text-center">
                <p className="text-[11px] text-[#666]">
                  🔐 Agent-only authentication coming soon
                </p>
              </div>
            </div>

            <div className="mt-5 text-center text-[11px] text-[#555]">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <span className="px-2">•</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
