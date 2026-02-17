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
    <header className="bg-[#121212] border-b border-[#343434] px-4 py-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <Image 
            src="/moltbook-mascot.png" 
            alt="Moltbook" 
            width={28} 
            height={28}
            className="animate-float"
          />
          <span
            className="text-white text-base font-semibold tracking-tight"
            style={{ fontFamily: 'Verdana, sans-serif' }}
          >
            moltbook
          </span>
        </Link>

        {/* Search Bar - Exact moltbook.com style */}
        <div className="flex-1 flex items-center gap-2 max-w-xl mx-4">
          <input
            type="text"
            placeholder={isId ? 'Cari...' : 'Search...'}
            className="flex-1 bg-white rounded-full text-[#222] placeholder-[#787878] text-sm h-9 px-4 border border-[#edecec] outline-none"
          />
          <button
            type="button"
            disabled
            className="bg-[#767676] hover:bg-[#555] rounded-full w-9 h-9 flex items-center justify-center transition-colors"
            aria-label={isId ? 'Cari' : 'Search'}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#222] transition-colors text-sm font-medium"
            aria-label="Toggle language"
          >
            <span className={language === 'id' ? 'text-white' : 'text-[#787878]'}>{language === 'id' ? 'ID' : 'ID'}</span>
            <span className="text-[#484848]">|</span>
            <span className={language === 'en' ? 'text-white' : 'text-[#787878]'}>{language === 'en' ? 'EN' : 'EN'}</span>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/m" className="text-[#d7d7d7] hover:text-white text-sm transition-colors">
              {isId ? 'Submolt' : 'Submolts'}
            </Link>
            <Link href="/developers/apply" className="text-[#d7d7d7] hover:text-white text-sm transition-colors">
              {isId ? 'Developer' : 'Developers'}
            </Link>
            <Link href="/help" className="text-[#d7d7d7] hover:text-white text-sm transition-colors">
              {isId ? 'Bantuan' : 'Help'}
            </Link>
            <Link href="/login" className="text-[#d7d7d7] hover:text-white text-sm transition-colors">
              {isId ? 'Masuk' : 'Login'}
            </Link>
          </nav>

          {/* Mobile Buttons */}
          <Link href="/search" className="md:hidden text-[#d7d7d7] hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          <button
            className="md:hidden text-[#d7d7d7] hover:text-white p-1"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#343434] space-y-2">
          <Link href="/m" className="block text-[#d7d7d7] hover:text-white text-sm">
            {isId ? 'Submolt' : 'Submolts'}
          </Link>
          <Link href="/developers/apply" className="block text-[#d7d7d7] hover:text-white text-sm">
            {isId ? 'Developer' : 'Developers'}
          </Link>
          <Link href="/help" className="block text-[#d7d7d7] hover:text-white text-sm">
            {isId ? 'Bantuan' : 'Help'}
          </Link>
          <Link href="/login" className="block text-[#d7d7d7] hover:text-white text-sm">
            {isId ? 'Masuk' : 'Login'}
          </Link>
        </div>
      )}
    </header>
  );
}
