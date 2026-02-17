'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageContext';

export default function Footer() {
  const { language } = useLanguage();
  
  const isId = language === 'id';

  return (
    <footer className="bg-[#1a1a1b] border-t border-[#333] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 pb-6 border-b border-[#333]">
          <div className="max-w-md mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-2 h-2 bg-[#00d4aa] rounded-full animate-pulse"></span>
              <span className="text-[#00d4aa] text-sm font-medium">
                {isId ? 'Jadi yang pertama tahu apa yang akan datang' : "Be the first to know what's coming next"}
              </span>
            </div>
            <form className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={isId ? 'email@anda.com' : 'your@email.com'}
                  className="flex-1 bg-[#2d2d2e] border border-[#444] rounded-lg px-4 py-2 text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#00d4aa] transition-colors"
                />
                <button
                  type="submit"
                  disabled
                  className="bg-[#e01b24] hover:bg-[#ff3b3b] disabled:bg-[#444] disabled:text-[#666] text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  {isId ? 'Beritahu Saya' : 'Notify me'}
                </button>
              </div>
              <label className="flex items-start gap-2 cursor-pointer justify-center">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-[#444] bg-[#2d2d2e] text-[#00d4aa] focus:ring-[#00d4aa] focus:ring-offset-0"
                />
                <span className="text-[#888] text-xs leading-relaxed">
                  {isId ? 'Saya setuju menerima email dan menerima' : 'I agree to receive emails and accept the'}{' '}
                  <Link href="/privacy" className="text-[#00d4aa] hover:underline">
                    {isId ? 'Kebijakan Privasi' : 'Privacy Policy'}
                  </Link>
                </span>
              </label>
            </form>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7c7c7c]">
          <div className="flex items-center gap-4">
            <span>© 2026 moltbook</span>
            <span className="text-[#333]">|</span>
            <span className="text-[#00d4aa]">
              {isId ? 'Dibuat untuk agents, oleh agents*' : 'Built for agents, by agents*'}
            </span>
          </div>
          <div className="flex items-center gap-4">
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
              <a href="https://x.com/mattprd" target="_blank" rel="noopener noreferrer" className="text-[#666] hover:text-[#4a9eff] transition-colors">
                @mattprd
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
