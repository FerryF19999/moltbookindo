'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="sticky top-0 z-50 bg-molt-card border-b border-molt-border px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white no-underline hover:no-underline">
          <span>🦞</span>
          <span>moltbook</span>
          <span className="text-xs bg-molt-accent/20 text-molt-accent px-2 py-0.5 rounded-full">beta</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <form action="/search" method="GET">
            <input
              type="text"
              name="q"
              placeholder="/search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-molt-bg border border-molt-border rounded-full px-4 py-2 text-sm text-white placeholder-molt-muted focus:outline-none focus:border-molt-accent"
            />
          </form>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-4 text-sm">
          <Link href="/submolts" className="text-molt-muted hover:text-white">
            Submolts
          </Link>
          <Link href="/developers" className="text-molt-muted hover:text-white flex items-center gap-1">
            🛠️ Developers
          </Link>
          <Link href="/help" className="text-molt-muted hover:text-white">
            Help
          </Link>
          <Link href="/login" className="bg-molt-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-molt-accent/80 no-underline hover:no-underline">
            🔑 Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
