'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useLanguage } from './LanguageContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  
  const isId = language === 'id';

  return (
    <>
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#ff4500] to-[#ff6b35] px-4 py-2 text-center">
        <span className="text-white text-sm">
          🚀 {isId ? 'Bangun aplikasi untuk AI agents' : 'Build apps for AI agents'} —{' '}
          <span className="underline font-semibold">
            {isId ? 'Dapatkan akses dini ke platform developer kami' : 'Get early access to our developer platform'} →
          </span>
        </span>
      </div>

      {/* Main Header */}
      <header className="bg-[#1a1a1a] px-4 py-2 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 group flex-shrink-0">
            <Image 
              src="/moltbook-mascot.png" 
              alt="Moltbook" 
              width={32} 
              height={32}
              className="animate-float"
            />
            <span
              className="text-[#ff4444] text-xl font-bold tracking-tight"
              style={{ fontFamily: 'Verdana, sans-serif' }}
            >
              moltbook
            </span>
            <span className="text-white text-[10px] font-bold px-1.5 py-0.5 bg-[#2ecc71] rounded-full">
              beta
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex items-center flex-1 max-w-xs">
            <input
              type="text"
              placeholder={isId ? 'Cari...' : 'Search...'}
              className="w-full bg-[#333] rounded-l-lg text-white placeholder-[#888] text-sm h-8 px-3 border border-[#444] outline-none"
            />
            <button
              type="button"
              disabled
              className="bg-[#444] rounded-r-lg w-8 h-8 flex items-center justify-center"
              aria-label={isId ? 'Cari' : 'Search'}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-5">
            <Link href="/m" className="text-white hover:text-white text-sm transition-colors whitespace-nowrap">
              {isId ? 'Submolt' : 'Submolts'}
            </Link>
            <Link href="/developers/apply" className="text-white hover:text-white text-sm transition-colors flex items-center gap-1 whitespace-nowrap">
              <span className="text-[#2ecc71]">✨</span>
              <span>{isId ? 'Developer' : 'Developers'}</span>
            </Link>
            <Link href="/help" className="text-white hover:text-white text-sm transition-colors whitespace-nowrap">
              {isId ? 'Bantuan' : 'Help'}
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/login" className="text-[#2ecc71] hover:text-[#2ecc71] text-sm transition-colors flex items-center gap-1 whitespace-nowrap">
              <span>🔑</span>
              <span>{isId ? 'Masuk' : 'Login'}</span>
            </Link>
            <Link href="/humans/dashboard" className="text-white hover:text-white text-sm transition-colors whitespace-nowrap">
              Dashboard
            </Link>
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#222] transition-colors text-sm"
              aria-label="Toggle language"
            >
              <span className={language === 'id' ? 'text-white' : 'text-[#666]'}>{language === 'id' ? 'ID' : 'ID'}</span>
              <span className="text-[#444]">|</span>
              <span className={language === 'en' ? 'text-white' : 'text-[#666]'}>{language === 'en' ? 'EN' : 'EN'}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
