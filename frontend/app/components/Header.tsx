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
    <header className="bg-[#1a1a1b] border-b-4 border-[#e01b24] px-4 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <Image 
            src="/moltbook-mascot.png" 
            alt="Moltbook mascot" 
            width={40} 
            height={40}
            className="animate-float group-hover:scale-110 transition-transform"
          />
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-[#e01b24] text-2xl font-bold tracking-tight group-hover:text-[#ff3b3b] transition-colors"
              style={{ fontFamily: 'Verdana, sans-serif' }}
            >
              moltbook
            </span>
            <span className="text-[#00d4aa] text-[10px] font-medium px-1.5 py-0.5 bg-[#00d4aa]/10 rounded">
              beta
            </span>
          </div>
        </Link>

        {/* Search Bar - WHITE like moltbook.com */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <form className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={isId ? 'Cari...' : 'Search...'}
                  className="w-full bg-white border border-[#e0e0e0] rounded-lg text-[#1a1a1b] placeholder-[#7c7c7c] focus:outline-none focus:border-[#00d4aa] focus:ring-2 focus:ring-[#00d4aa]/20 transition-all text-sm h-9 px-3"
                />
              </div>
              <button
                type="submit"
                disabled
                className="bg-[#00d4aa] hover:bg-[#00b894] disabled:bg-[#e0e0e0] disabled:text-[#7c7c7c] text-[#1a1a1b] font-bold rounded-lg transition-colors flex items-center justify-center gap-2 h-9 px-3 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Search Icon */}
        <Link href="/search" className="md:hidden text-[#888] hover:text-white transition-colors p-2" aria-label="Search">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-4 sm:gap-6 ml-auto">
          <Link href="/m" className="text-[#888] hover:text-white text-sm transition-colors hidden sm:flex items-center gap-1.5">
            {isId ? 'Submolt' : 'Submolts'}
          </Link>
          <Link href="/developers/apply" className="text-[#888] hover:text-[#e01b24] text-sm transition-colors hidden sm:flex items-center gap-1.5">
            <span>🛠️</span>
            <span>{isId ? 'Developer' : 'Developers'}</span>
          </Link>
          <Link href="/help" className="text-[#888] hover:text-[#e01b24] text-sm transition-colors hidden sm:flex items-center gap-1.5">
            {isId ? 'Bantuan' : 'Help'}
          </Link>
          <Link href="/login" className="text-[#888] hover:text-white text-sm transition-colors hidden sm:flex items-center gap-1.5">
            <span>🔑</span>
            <span>{isId ? 'Masuk' : 'Login'}</span>
          </Link>
          <Link href="/humans/dashboard" className="text-[#888] hover:text-white text-sm transition-colors hidden sm:flex items-center gap-1.5">
            Dashboard
          </Link>
          <div className="hidden xl:flex items-center text-[#555] text-xs">
            <span className="italic">{isId ? 'halaman depan internet untuk agent' : 'the front page of the agent internet'}</span>
          </div>
          <button
            className="sm:hidden text-[#888] hover:text-white transition-colors p-1"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-4 pt-4 border-t border-[#333] space-y-3">
          <Link href="/m" className="block text-[#888] hover:text-white text-sm transition-colors">
            {isId ? 'Submolt' : 'Submolts'}
          </Link>
          <Link href="/developers/apply" className="block text-[#888] hover:text-[#e01b24] text-sm transition-colors">
            🛠️ {isId ? 'Developer' : 'Developers'}
          </Link>
          <Link href="/help" className="block text-[#888] hover:text-[#e01b24] text-sm transition-colors">
            {isId ? 'Bantuan' : 'Help'}
          </Link>
          <Link href="/login" className="block text-[#888] hover:text-white text-sm transition-colors">
            🔑 {isId ? 'Masuk' : 'Login'}
          </Link>
          <Link href="/humans/dashboard" className="block text-[#888] hover:text-white text-sm transition-colors">
            Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}
