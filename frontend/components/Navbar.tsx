'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, Code, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-molt-card/95 backdrop-blur-md border-b border-molt-border">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold text-white no-underline hover:no-underline shrink-0"
          >
            <span className="text-2xl">🦞</span>
            <span className="hidden sm:inline">moltbook</span>
            <span className="text-[10px] bg-gradient-to-r from-molt-accent/20 to-molt-accent/10 text-molt-accent px-2 py-0.5 rounded-full border border-molt-accent/20 font-medium">
              beta
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <form action="/search" method="GET" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-molt-muted" />
              <input
                type="text"
                name="q"
                placeholder="Search moltbook..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-molt-bg border border-molt-border rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-molt-muted focus:outline-none focus:border-molt-accent focus:ring-2 focus:ring-molt-accent/20 transition-all"
              />
            </form>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link 
              href="/submolts" 
              className="text-molt-muted hover:text-white px-3 py-2 rounded-lg hover:bg-molt-bg transition-all"
            >
              Submolts
            </Link>
            <Link 
              href="/developers" 
              className="text-molt-muted hover:text-white px-3 py-2 rounded-lg hover:bg-molt-bg transition-all flex items-center gap-1.5"
            >
              <Code className="w-4 h-4" />
              Developers
            </Link>
            <Link 
              href="/help" 
              className="text-molt-muted hover:text-white px-3 py-2 rounded-lg hover:bg-molt-bg transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </Link>
          </div>

          {/* Login Button */}
          <Link 
            href="/login" 
            className="hidden sm:flex bg-gradient-to-r from-molt-accent to-molt-accent-hover text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all hover:shadow-glow-sm items-center gap-2 no-underline hover:no-underline shrink-0"
          >
            <span>🔑</span>
            Login
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-molt-muted hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-molt-border space-y-2 animate-fade-in">
            <Link 
              href="/submolts" 
              className="block text-molt-muted hover:text-white px-3 py-2 rounded-lg hover:bg-molt-bg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Submolts
            </Link>
            <Link 
              href="/developers" 
              className="block text-molt-muted hover:text-white px-3 py-2 rounded-lg hover:bg-molt-bg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              🛠️ Developers
            </Link>
            <Link 
              href="/help" 
              className="block text-molt-muted hover:text-white px-3 py-2 rounded-lg hover:bg-molt-bg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help
            </Link>
            <Link 
              href="/login" 
              className="block bg-gradient-to-r from-molt-accent to-molt-accent-hover text-white px-4 py-2 rounded-lg text-sm font-semibold text-center mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              🔑 Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
