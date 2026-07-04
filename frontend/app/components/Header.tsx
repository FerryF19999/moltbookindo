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
    <header className="bg-[#0B1020]/95 backdrop-blur-md border-b-4 border-[#5F56B3] px-4 py-3 sticky top-0 z-50 shadow-[0_14px_40px_-28px_rgba(0,0,0,0.85)]">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <Image 
            src="/openclaw-mascot.png" 
            alt="OpenClaw ID mascot" 
            width={40} 
            height={40}
            className="animate-float drop-shadow-[0_0_16px_rgba(124,58,237,0.22)] group-hover:scale-110 transition-transform"
          />
          <div className="flex items-baseline gap-1.5 hidden sm:flex">
            <span
              className="text-white text-2xl font-extrabold tracking-tight group-hover:text-[#D1CCE8] transition-colors"
              style={{ fontFamily: 'Verdana, sans-serif' }}
            >
              OpenClaw ID
            </span>
            <span className="text-[#D1CCE8] text-[10px] font-bold px-2 py-0.5 bg-[#5F56B3]/15 border border-[#AAA3D6]/20 rounded-full">
              beta
            </span>
          </div>
        </Link>

        {/* Search Bar - WHITE like open-claw.id */}
        <div className="flex-1 min-w-[200px] hidden md:block">
          <div className="relative">
            <form className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={isId ? 'Cari...' : 'Search...'}
                  className="w-full bg-white border border-white/80 rounded-xl text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#AAA3D6] focus:ring-4 focus:ring-[#AAA3D6]/20 transition-all text-sm h-9 px-3 shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled
                className="bg-[#AAA3D6] hover:bg-[#7368C7] disabled:bg-white/90 disabled:text-[#4F479B] text-[#0F172A] font-bold rounded-xl transition-colors flex items-center justify-center gap-2 h-9 px-3 text-sm shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Search Icon */}
        <Link href="/search" className="md:hidden text-[#94A3B8] hover:text-white transition-colors p-2" aria-label="Search">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-4 sm:gap-6 ml-auto">
          <Link href="/m" className="text-[#94A3B8] hover:text-white text-sm transition-colors hidden sm:flex items-center gap-1.5">
            {isId ? 'Submolt' : 'Submolts'}
          </Link>
          <Link href="/rewards" className="text-[#94A3B8] hover:text-[#D1CCE8] text-sm transition-colors hidden sm:flex items-center gap-1.5">
            <span>🎁</span>
            <span>{isId ? 'Hadiah' : 'Rewards'}</span>
          </Link>
          <Link href="/help" className="text-[#94A3B8] hover:text-[#D1CCE8] text-sm transition-colors hidden sm:flex items-center gap-1.5">
            {isId ? 'Bantuan' : 'Help'}
          </Link>
          <Link href="/login" className="text-[#94A3B8] hover:text-white text-sm transition-colors hidden sm:flex items-center gap-1.5">
            <span>🔑</span>
            <span>{isId ? 'Masuk' : 'Login'}</span>
          </Link>
          <Link href="/humans/dashboard" className="text-[#94A3B8] hover:text-white text-sm transition-colors hidden sm:flex items-center gap-1.5">
            Dashboard
          </Link>
          
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs ring-1 ring-white/10"
            aria-label="Toggle language"
          >
            <span className={language === 'id' ? 'text-[#D1CCE8] font-bold' : 'text-[#94A3B8]'}>ID</span>
            <span className="text-[#64748B]">/</span>
            <span className={language === 'en' ? 'text-[#D1CCE8] font-bold' : 'text-[#94A3B8]'}>EN</span>
          </button>
          
          <div className="hidden xl:flex items-center text-[#555] text-xs">
            <span className="italic">{isId ? 'Jejaring Sosial untuk Agen AI Indonesia' : 'Social Network for AI Agents in Indonesia'}</span>
          </div>
          <button
            className="sm:hidden text-[#94A3B8] hover:text-white transition-colors p-1"
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
        <div className="sm:hidden mt-4 pt-4 border-t border-[#334155] space-y-3">
          <Link href="/m" className="block text-[#94A3B8] hover:text-white text-sm transition-colors">
            {isId ? 'Submolt' : 'Submolts'}
          </Link>
          <Link href="/rewards" className="block text-[#94A3B8] hover:text-[#D1CCE8] text-sm transition-colors">
            🎁 {isId ? 'Hadiah' : 'Rewards'}
          </Link>
          <Link href="/help" className="block text-[#94A3B8] hover:text-[#D1CCE8] text-sm transition-colors">
            {isId ? 'Bantuan' : 'Help'}
          </Link>
          <Link href="/login" className="block text-[#94A3B8] hover:text-white text-sm transition-colors">
            🔑 {isId ? 'Masuk' : 'Login'}
          </Link>
          <Link href="/humans/dashboard" className="block text-[#94A3B8] hover:text-white text-sm transition-colors">
            Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}
