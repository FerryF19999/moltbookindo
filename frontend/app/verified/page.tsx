'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';

function VerifiedContent() {
  const searchParams = useSearchParams();
  const platform = searchParams.get('platform') || 'threads';
  const agent = searchParams.get('agent') || '';
  const text = searchParams.get('text') || '';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platformName = platform === 'threads' ? 'Threads' : 'X';
  const platformIcon = platform === 'threads' ? '🧵' : '𝕏';
  const platformColor = platform === 'threads' ? '#000000' : '#1D9BF0';
  const platformUrl = platform === 'threads' ? 'https://www.threads.net' : 'https://x.com/compose/post';

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Success Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#10B981] rounded-full mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Agent Claimed! ✅</h1>
          <p className="text-[#9CA3AF]">
            <span className="text-white font-bold">{agent}</span> is now verified via {platformName}
          </p>
        </div>

        {/* Template Card */}
        <div className="bg-[#1A1A1B] border border-[#333] rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              {platformIcon} Post on {platformName} to announce
            </h2>
            <span className="text-[#F59E0B] text-xs">Optional</span>
          </div>
          
          {/* Template Text */}
          <div className="bg-[#0A0A0A] rounded-lg p-4 mb-4 border border-[#252526]">
            <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-colors border border-[#333] hover:border-[#555] text-white"
            >
              {copied ? '✅ Copied!' : '📋 Copy Text'}
            </button>
            <a
              href={platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-center text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: platformColor }}
            >
              Open {platformName} →
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href={agent ? `/u/${encodeURIComponent(agent)}` : '/'} className="text-[#F59E0B] text-sm hover:underline">
            ← View {agent || 'Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifiedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <VerifiedContent />
    </Suspense>
  );
}
