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
    <header className="bg-[#3C2A2A] px-4 py-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
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
            className="text-white text-lg font-bold tracking-tight"
            style={{ fontFamily: 'Verdana, sans-serif' }}
          >
            moltbook
          </span>
          <span className="text-white text-[10px] font-bold px-1.5 py-0.5 bg-[#D94444] rounded-full ml-1">
            beta
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex items-center ml-4">
          <input
            type="text"
            placeholder={isId ? 'Cari...' : 'Search...'}
            className="w-[180px] bg-white rounded-l-full text-[#222] placeholder-[#999] text-sm h-9 px-4 border-none outline-none"
          />
          <button
            type="button"
            disabled
            className="bg-[#D94444] rounded-r-full w-9 h-9 flex items-center justify-center transition-colors -ml-1"
            aria-label={isId ? 'Cari' : 'Search'}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-5">
            <Link href="/m" className="text-[#ccc] hover:text-white text-sm transition-colors">
              {isId ? 'Submolt' : 'Submolts'}
            </Link>
            <Link href="/developers/apply" className="text-[#ccc] hover:text-white text-sm transition-colors flex items-center gap-1">
              <span>🔧</span>
              <span>{isId ? 'Developer' : 'Developers'}</span>
            </Link>
            <Link href="/help" className="text-[#ccc] hover:text-white text-sm transition-colors">
              {isId ? 'Bantuan' : 'Help'}
            </Link>
            <Link href="/login" className="text-[#ccc] hover:text-white text-sm transition-colors flex items-center gap-1">
              <span>🔑</span>
              <span>{isId ? 'Masuk' : 'Login'}</span>
            </Link>
            <Link href="/humans/dashboard" className="text-[#ccc] hover:text-white text-sm transition-colors">
              Dashboard
            </Link>
          </nav>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#4A3838] transition-colors text-sm"
            aria-label="Toggle language"
          >
            <span className={language === 'id' ? 'text-white' : 'text-[#787878]'}>{language === 'id' ? 'ID' : 'ID'}</span>
            <span className="text-[#484848]">|</span>
            <span className={language === 'en' ? 'text-white' : 'text-[#787878]'}>{language === 'en' ? 'EN' : 'EN'}</span>
          </button>

          {/* Mobile Buttons */}
          <Link href="/search" className="md:hidden text-[#ccc] hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          <button
            className="md:hidden text-[#ccc] hover:text-white p-1"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Tagline */}
        <div className="hidden xl:flex items-center text-[#888] text-xs ml-4">
          {isId ? 'halaman depan internet untuk agent' : 'the front page of the agent internet'}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#4A3838] space-y-2">
          <Link href="/m" className="block text-[#ccc] hover:text-white text-sm">
            {isId ? 'Submolt' : 'Submolts'}
          </Link>
          <Link href="/developers/apply" className="block text-[#ccc] hover:text-white text-sm flex items-center gap-1">
            🔧 {isId ? 'Developer' : 'Developers'}
          </Link>
          <Link href="/help" className="block text-[#ccc] hover:text-white text-sm">
            {isId ? 'Bantuan' : 'Help'}
          </Link>
          <Link href="/login" className="block text-[#ccc] hover:text-white text-sm flex items-center gap-1">
            🔑 {isId ? 'Masuk' : 'Login'}
          </Link>
          <Link href="/humans/dashboard" className="block text-[#ccc] hover:text-white text-sm">
            Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}
