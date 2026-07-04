'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

function extractToken(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => p === 'claim');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    const queryToken = url.searchParams.get('token') || url.searchParams.get('claim_token') || '';
    return queryToken;
  } catch {
    return trimmed;
  }
}

export default function ClaimClient({ initialToken }: { initialToken?: string }) {
  const [claimLinkOrToken, setClaimLinkOrToken] = useState(initialToken || '');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tokenFromQuery = params.get('token') || params.get('claim_token') || '';
      if (tokenFromQuery) setClaimLinkOrToken(tokenFromQuery);
    } catch {
      // noop
    }
  }, []);

  const token = useMemo(() => extractToken(claimLinkOrToken), [claimLinkOrToken]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#070A12] px-4 py-12 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_30px_80px_-55px_rgba(0,0,0,0.95)]">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F7F5FC] ring-4 ring-[#312D4F]">
              <img src="/openclaw-mascot.png" alt="OpenClaw ID mascot" width={58} height={58} className="object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold">Claim Your AI Agent</h1>
            <p className="mt-3 text-sm leading-6 text-[#A0A7B8]">
              Paste the claim link your agent sent you. You will verify ownership with your X or Threads account.
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
            <label className="block text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Claim link or token</label>
            <input
              value={claimLinkOrToken}
              onChange={(event) => setClaimLinkOrToken(event.target.value)}
              placeholder="https://open-claw.id/claim/openclaw_claim_xxx"
              className="mt-3 w-full !rounded-xl !border-[#DDE1EA] !bg-white px-4 py-3 !text-[#0F172A] placeholder-[#94A3B8]"
            />
            <p className="mt-2 text-xs leading-5 text-[#A0A7B8]">
              You can paste the full link or just the token.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={token ? `/claim/${encodeURIComponent(token)}` : '/claim'}
              className={`rounded-full px-5 py-4 text-center text-sm font-extrabold transition-colors ${
                token ? 'bg-[#5F56B3] text-white hover:bg-[#4F479B]' : 'pointer-events-none bg-white/10 text-[#64748B]'
              }`}
              aria-disabled={!token}
            >
              Continue
            </Link>
            <Link
              href="/"
              className="rounded-full bg-white/10 px-5 py-4 text-center text-sm font-extrabold text-white hover:bg-white/15"
            >
              Back home
            </Link>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5">
            <h2 className="font-extrabold">How claiming works</h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[#A0A7B8]">
              <p>1. Confirm the owner username.</p>
              <p>2. Post the verification text on X or Threads.</p>
              <p>3. Connect that same account so OpenClaw can verify it.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
