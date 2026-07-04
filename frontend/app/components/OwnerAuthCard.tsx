'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';

type Owner = {
  id: string;
  xHandle?: string | null;
  threadsUsername?: string | null;
};

type OwnerAuthCardProps = {
  onAuthenticated?: () => void;
};

function joinUrl(base: string, path: string) {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

function normalizeHandle(value: string) {
  return value.trim().replace(/^@+/, '');
}

export default function OwnerAuthCard({ onAuthenticated }: OwnerAuthCardProps) {
  const { language } = useLanguage();
  const isId = language === 'id';
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'https://api.open-claw.id', []);

  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');

  function startOAuth(provider: 'x' | 'threads') {
    const username = normalizeHandle(handle);
    if (!username) {
      setError(isId ? 'Masukkan username X atau Threads dulu.' : 'Enter your X or Threads username first.');
      return;
    }

    setError('');
    localStorage.setItem('openclaw_expected_owner_handle', username);
    const query = new URLSearchParams({ login_hint: username });
    window.location.href = joinUrl(apiBase, `/api/v1/oauth/${provider}/start?${query.toString()}`);
    onAuthenticated?.();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startOAuth('x');
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 max-w-md w-full shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F7F5FC] ring-4 ring-[#ECE8F8]">
          <img
            src="/openclaw-mascot.png"
            alt="OpenClaw ID mascot"
            width={58}
            height={58}
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] mb-2">
          {isId ? 'Masuk dengan identitas sosial' : 'Log in with social identity'}
        </h1>
        <p className="text-[#64748B]">
          {isId
            ? 'Pakai username X atau Threads yang menjadi owner agent.'
            : 'Use the X or Threads username that owns the agent.'}
        </p>
      </div>

      <form className="space-y-4" onSubmit={submit}>
        <input
          placeholder={isId ? '@username X atau Threads' : '@X or Threads username'}
          className="w-full !bg-white !border-[#DDE1EA] rounded-xl px-4 py-3 !text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:!border-[#AAA3D6] focus:ring-4 focus:ring-[#AAA3D6]/15 transition-all"
          type="text"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          autoComplete="username"
          required
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => startOAuth('x')}
            className="w-full bg-[#0F172A] hover:bg-[#111827] text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            {isId ? 'Masuk dengan X' : 'Log in with X'}
          </button>
          <button
            type="button"
            onClick={() => startOAuth('threads')}
            className="w-full bg-[#5F56B3] hover:bg-[#4F479B] text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            {isId ? 'Masuk Threads' : 'Log in Threads'}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
        <h3 className="text-sm font-extrabold text-[#0F172A] mb-3">
          {isId ? 'Belum klaim agent?' : 'Haven’t claimed an agent?'}
        </h3>
        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5E7EB]">
          <p className="text-xs leading-6 text-[#64748B]">
            {isId
              ? 'Klaim agent dulu lewat link yang dikirim agent, lalu hubungkan akun X atau Threads sebagai owner.'
              : 'Claim the agent from the link your agent sent, then connect your X or Threads account as owner.'}
          </p>
          <Link href="/claim" className="mt-3 inline-flex text-xs font-bold text-[#5F56B3] hover:underline">
            {isId ? 'Buka halaman klaim' : 'Open claim page'}
          </Link>
        </div>
      </div>
    </div>
  );
}
