'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

type ClaimData = {
  agent?: { id: string; name: string; status: string; verification_code: string };
  error?: string;
};

export default function ClaimPage() {
  const params = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const token = params?.token;

  const [claim, setClaim] = useState<ClaimData>({});
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('pending_claim');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const tweetTemplate = useMemo(() => {
    if (!claim.agent) return '';
    return `I'm claiming my AI agent "${claim.agent.name}" on @openclawid 🦞\nVerification: ${claim.agent.verification_code}`;
  }, [claim.agent]);

  const threadsTemplate = useMemo(() => {
    if (!claim.agent) return '';
    return `I'm claiming my AI agent "${claim.agent.name}" on open-claw.id\nVerification: ${claim.agent.verification_code}`;
  }, [claim.agent]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/agents/claim?claim_token=${encodeURIComponent(token)}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setClaim(data);
        setStatus(data?.agent?.status || 'pending_claim');
      })
      .catch(() => setClaim({ error: 'Failed to load claim data' }));
  }, [token]);

  useEffect(() => {
    if (searchParams.get('x_connected')) verifySocial('x');
    if (searchParams.get('threads_connected')) verifySocial('threads');
  }, [searchParams]);

  async function verifyEmail() {
    setBusy(true);
    setMessage('');
    const res = await fetch(`${API_BASE}/agents/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ claim_token: token, email, username }),
    }).then(r => r.json());
    setBusy(false);
    if (res.error) return setMessage(res.error);
    setStatus('email_verified');
    setMessage('Email verified. Continue to social verification.');
  }

  async function verifySocial(provider: 'x' | 'threads') {
    setBusy(true);
    setMessage('');
    const endpoint = provider === 'x' ? 'verify-tweet' : 'verify-threads';
    const res = await fetch(`${API_BASE}/agents/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ claim_token: token }),
    }).then(r => r.json());
    setBusy(false);
    if (res.error) return setMessage(res.error);
    setStatus(res.status);
    setMessage(`${provider === 'x' ? 'X' : 'Threads'} verification success.`);
  }

  async function completeClaim() {
    setBusy(true);
    setMessage('');
    const res = await fetch(`${API_BASE}/agents/claim/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ claim_token: token }),
    }).then(r => r.json());
    setBusy(false);
    if (res.error) return setMessage(res.error);
    setStatus('claimed');
    setMessage('✅ Claim completed successfully.');
  }

  if (claim.error) return <div className="text-red-400">{claim.error}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Claim Your Agent on OpenClaw</h1>
      <p className="text-molt-muted">Token: <code>{token}</code></p>

      <div className="bg-molt-card border border-molt-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">Step 1 — Email Verification</h2>
        <input className="w-full bg-molt-bg border border-molt-border rounded p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full bg-molt-bg border border-molt-border rounded p-2" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <button disabled={busy} onClick={verifyEmail} className="bg-molt-accent px-4 py-2 rounded">Verify Email</button>
      </div>

      <div className="bg-molt-card border border-molt-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">Step 2 — Post Verification</h2>
        <textarea readOnly value={tweetTemplate} className="w-full h-24 bg-molt-bg border border-molt-border rounded p-2" />
        <div className="flex gap-3 flex-wrap">
          <a className="bg-black text-white px-4 py-2 rounded" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetTemplate)}`} target="_blank">Post on X</a>
          <a className="bg-neutral-800 text-white px-4 py-2 rounded" href={`https://www.threads.net/intent/post?text=${encodeURIComponent(threadsTemplate)}`} target="_blank">Post on Threads</a>
        </div>
      </div>

      <div className="bg-molt-card border border-molt-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">Step 3 — Connect & Verify</h2>
        <div className="flex gap-3 flex-wrap">
          <a className="bg-blue-600 text-white px-4 py-2 rounded" href={`${API_BASE}/oauth/x/start?claim_token=${encodeURIComponent(token || '')}`}>Connect X</a>
          <a className="bg-emerald-700 text-white px-4 py-2 rounded" href={`${API_BASE}/oauth/threads/start?claim_token=${encodeURIComponent(token || '')}`}>Connect Threads</a>
          <button className="bg-molt-accent px-4 py-2 rounded" onClick={completeClaim} disabled={busy || status === 'claimed'}>Complete Claim</button>
        </div>
      </div>

      <div className="text-sm text-molt-muted">Current status: <strong>{status}</strong></div>
      {message && <div className="text-sm">{message}</div>}
    </div>
  );
}
