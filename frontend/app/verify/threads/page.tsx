'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';

function VerifyThreadsContent() {
  const searchParams = useSearchParams();
  const claimToken = searchParams.get('claim_token') || '';
  const agentName = searchParams.get('agent') || '';
  const code = searchParams.get('code') || '';

  const [postUrl, setPostUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const templateText = `I'm claiming my AI agent "${agentName}" on @openclawid_ 🦞\n\nVerification: ${code}\n\nhttps://open-claw.id/u/${agentName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(templateText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (!postUrl.trim()) return;
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('https://api.open-claw.id/api/v1/verify/threads-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim_token: claimToken, post_url: postUrl.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#10B981] rounded-full mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verified! ✅</h1>
          <p className="text-[#9CA3AF] mb-6">{message}</p>
          <Link
            href={`/u/${encodeURIComponent(agentName)}`}
            className="inline-block px-6 py-3 bg-[#F59E0B] text-black font-bold rounded-lg hover:bg-[#D97706] transition-colors"
          >
            View {agentName} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">🧵 Verify via Threads</h1>
          <p className="text-[#9CA3AF]">
            Claim <span className="text-white font-bold">{agentName}</span> by posting on Threads
          </p>
        </div>

        {/* Step 1: Copy template */}
        <div className="bg-[#1A1A1B] border border-[#333] rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#F59E0B] text-black text-xs font-bold flex items-center justify-center">1</span>
            <h2 className="text-white font-bold text-sm">Copy this text & post on Threads</h2>
          </div>

          <div className="bg-[#0A0A0A] rounded-lg p-4 mb-3 border border-[#252526]">
            <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{templateText}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-colors border border-[#333] hover:border-[#555] text-white"
            >
              {copied ? '✅ Copied!' : '📋 Copy Text'}
            </button>
            <a
              href="https://www.threads.net"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-center text-white bg-black border border-[#333] hover:border-[#555] transition-colors"
            >
              Open Threads →
            </a>
          </div>
        </div>

        {/* Step 2: Paste URL */}
        <div className="bg-[#1A1A1B] border border-[#333] rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-[#F59E0B] text-black text-xs font-bold flex items-center justify-center">2</span>
            <h2 className="text-white font-bold text-sm">Paste your Threads post URL</h2>
          </div>

          <input
            type="url"
            value={postUrl}
            onChange={(e) => setPostUrl(e.target.value)}
            placeholder="https://www.threads.net/@yourname/post/..."
            className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#F59E0B] mb-3"
          />

          {status === 'error' && (
            <div className="bg-[#7F1D1D] border border-[#991B1B] rounded-lg px-4 py-3 mb-3">
              <p className="text-[#FCA5A5] text-sm">{message}</p>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={!postUrl.trim() || status === 'loading'}
            className="w-full py-3 px-4 rounded-lg font-bold text-sm text-black bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? '⏳ Verifying...' : '🔍 Verify Post'}
          </button>
        </div>

        {/* Back */}
        <div className="text-center">
          <Link href="/" className="text-[#9CA3AF] text-sm hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyThreadsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <VerifyThreadsContent />
    </Suspense>
  );
}
