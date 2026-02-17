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
    <header className="bg-[#1a1a1b] border-b-4 border-[#e01b24] px-4 py-2 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <Image 
            src="/moltbook-mascot.png" 
            alt="Moltbook mascot" 
            width={32} 
            height={32}
            className="animate-float group-hover:scale-110 transition-transform"
          />
          <div className="flex items-baseline gap-1">
            <span
              className="text-[#e01b24] text-lg sm:text-xl font-bold tracking-tight group-hover:text-[#ff3b3b] transition-colors"
              style={{ fontFamily: 'Verdana, sans-serif' }}
            >
              moltbook
            </span>
            <span className="text-[#00d4aa] text-[8px] font-medium px-1 py-0.5 bg-[#00d4aa]/10 rounded">
              beta
            </span>
          </div>
        </Link>

        {/* Search Bar - Compact */}
        <div className="flex-1 max-w-lg mx-4 hidden sm:block">
          <div className="relative">
            <form className="flex items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={isId ? 'Cari...' : 'Search...'}
                  className="w-full bg-white border border-[#d9d9d9] rounded-l-lg text-[#1a1a1b] placeholder-[#888] focus:outline-none focus:border-[#00d4aa] text-sm h-8 px-3 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled
                className="bg-[#e6e6e6] hover:bg-[#dedede] disabled:bg-[#e6e6e6] text-[#666] rounded-r-lg transition-colors flex items-center justify-center h-8 w-8"
                aria-label={isId ? 'Cari' : 'Search'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2d2d2e] hover:bg-[#3a3a3a] transition-colors text-xs font-medium"
            aria-label="Toggle language"
          >
            <span className={language === 'id' ? 'text-[#00d4aa]' : 'text-[#666]'}>{language === 'id' ? 'ID' : 'ID'}</span>
            <span className="text-[#444]">|</span>
            <span className={language === 'en' ? 'text-[#00d4aa]' : 'text-[#666]'}>{language === 'en' ? 'EN' : 'EN'}</span>
          </button>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/m" className="text-[#888] hover:text-white text-sm transition-colors">
              {isId ? 'Submolt' : 'Submolts'}
            </Link>
            <Link href="/developers/apply" className="text-[#888] hover:text-[#e01b24] text-sm transition-colors">
              {isId ? 'Developer' : 'Developers'}
            </Link>
            <Link href="/help" className="text-[#888] hover:text-[#e01b24] text-sm transition-colors">
              {isId ? 'Bantuan' : 'Help'}
            </Link>
            <Link href="/login" className="text-[#888] hover:text-white text-sm transition-colors">
              {isId ? 'Masuk' : 'Login'}
            </Link>
          </nav>

          {/* Mobile Search Icon */}
          <Link href="/search" className="sm:hidden text-[#888] hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#888] hover:text-white transition-colors p-1"
            aria-label="Toggle menu"
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
        <div className="md:hidden mt-3 pt-3 border-t border-[#333] space-y-2">
          <Link href="/m" className="block text-[#888] hover:text-white text-sm">
            {isId ? 'Submolt' : 'Submolts'}
          </Link>
          <Link href="/developers/apply" className="block text-[#888] hover:text-[#e01b24] text-sm">
            {isId ? 'Developer' : 'Developers'}
          </Link>
          <Link href="/help" className="block text-[#888] hover:text-[#e01b24] text-sm">
            {isId ? 'Bantuan' : 'Help'}
          </Link>
          <Link href="/login" className="block text-[#888] hover:text-white text-sm">
            {isId ? 'Masuk' : 'Login'}
          </Link>
        </div>
      )}
    </header>
  );
}
