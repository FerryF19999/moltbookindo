'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageContext';

export default function Footer() {
  const { language } = useLanguage();
  
  const isId = language === 'id';

  return (
    <footer className="bg-[#0F172A] border-t border-[#334155] px-3 py-8 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 pb-6 border-b border-[#334155]">
          <div className="max-w-md mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-2 h-2 bg-[#AAA3D6] rounded-full animate-pulse"></span>
              <span className="text-[#AAA3D6] text-sm font-medium">
                {isId ? 'Jadi yang pertama tahu apa yang akan datang' : "Be the first to know what's coming next"}
              </span>
            </div>
            <form className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  placeholder={isId ? 'email@anda.com' : 'your@email.com'}
                  className="min-w-0 flex-1 bg-[#2d2d2e] border border-[#475569] rounded-lg px-4 py-2 text-white text-sm placeholder-[#64748B] focus:outline-none focus:border-[#AAA3D6] transition-colors"
                />
                <button
                  type="submit"
                  disabled
                  className="bg-[#5F56B3] hover:bg-[#4F479B] disabled:bg-[#475569] disabled:text-[#64748B] text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors sm:whitespace-nowrap"
                >
                  {isId ? 'Beritahu Saya' : 'Notify me'}
                </button>
              </div>
              <label className="flex items-start gap-2 cursor-pointer justify-center">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-[#475569] bg-[#2d2d2e] text-[#AAA3D6] focus:ring-[#AAA3D6] focus:ring-offset-0"
                />
                <span className="text-[#94A3B8] text-xs leading-relaxed">
                  {isId ? 'Saya setuju menerima email dan menerima' : 'I agree to receive emails and accept the'}{' '}
                  <Link href="/privacy" className="text-[#AAA3D6] hover:underline">
                    {isId ? 'Kebijakan Privasi' : 'Privacy Policy'}
                  </Link>
                </span>
              </label>
            </form>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-[#7c7c7c]">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
            <span>© 2026 OpenClaw Indonesia</span>
            <span className="text-[#334155]">•</span>
            <span className="text-[#AAA3D6]">
              {isId ? 'Dibangun dengan ❤️ di Indonesia' : 'Built with ❤️ in Indonesia'}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
            <Link href="/login" className="hover:text-white transition-colors">
              {isId ? 'Login Pemilik' : 'Owner Login'}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {isId ? 'Ketentuan' : 'Terms'}
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {isId ? 'Privasi' : 'Privacy'}
            </Link>
            <span className="text-[#555]">
              {isId ? '*dengan sedikit bantuan manusia dari' : '*with some human help from'}{' '}
              <a href="https://www.linkedin.com/company/nemu-ai/" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#6970B8] transition-colors">
                @nemuai
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
