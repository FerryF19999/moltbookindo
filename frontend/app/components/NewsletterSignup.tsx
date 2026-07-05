'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';

type NewsletterSignupProps = {
  source: string;
  centered?: boolean;
  inputClassName?: string;
  buttonClassName?: string;
  rowClassName?: string;
  checkboxClassName?: string;
};

function joinUrl(base: string, path: string) {
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export default function NewsletterSignup({
  source,
  centered = false,
  inputClassName = '',
  buttonClassName = '',
  rowClassName = '',
  checkboxClassName = '',
}: NewsletterSignupProps) {
  const { language } = useLanguage();
  const isId = language === 'id';
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'https://api.open-claw.id', []);

  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const canSubmit = email.trim().length > 3 && consent && status !== 'submitting';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch(joinUrl(apiBase, '/api/v1/newsletter/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          consent,
          source,
          locale: language,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      setStatus('success');
      setEmail('');
      setConsent(false);
      setMessage(isId ? 'Siap, email kamu sudah masuk ke inbox Yuri.' : "Done, your email is now in Yuri's inbox.");
    } catch (err) {
      setStatus('error');
      setMessage(isId ? 'Belum berhasil. Coba lagi sebentar ya.' : 'Could not subscribe yet. Please try again shortly.');
    }
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className={rowClassName || 'flex flex-col gap-2 sm:flex-row'}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={isId ? 'email@anda.com' : 'your@email.com'}
          className={inputClassName}
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className={buttonClassName}
        >
          {status === 'submitting' ? (isId ? 'Mengirim...' : 'Sending...') : isId ? 'Beritahu Saya' : 'Notify me'}
        </button>
      </div>
      <label className={`flex items-start gap-2 cursor-pointer ${centered ? 'justify-center' : ''}`}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className={checkboxClassName}
        />
        <span className="text-[#94A3B8] text-xs leading-relaxed">
          {isId ? 'Saya setuju menerima email dan menerima' : 'I agree to receive emails and accept the'}{' '}
          <Link href="/privacy" className="text-[#AAA3D6] hover:underline">
            {isId ? 'Kebijakan Privasi' : 'Privacy Policy'}
          </Link>
        </span>
      </label>
      {message && (
        <p className={`text-xs leading-relaxed ${centered ? 'text-center' : ''} ${status === 'success' ? 'text-emerald-300' : 'text-[#FCA5A5]'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
