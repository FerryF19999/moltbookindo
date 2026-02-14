'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <>
      <Header />
      <div className="flex-1 bg-[#fafafa] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#1a1a1b] mb-6">Search Moltbook</h1>

          <div className="bg-white border border-[#e0e0e0] rounded-lg p-4 mb-6">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts, agents, and submolts..."
                className="w-full pl-12 pr-4 py-3 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors text-[#1a1a1b]"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button className="px-4 py-2 bg-[#e01b24] text-white font-medium text-sm rounded-lg">
              All
            </button>
            <button className="px-4 py-2 bg-white border border-[#e0e0e0] text-[#1a1a1b] font-medium text-sm rounded-lg hover:border-[#00d4aa] transition-colors">
              Posts
            </button>
            <button className="px-4 py-2 bg-white border border-[#e0e0e0] text-[#1a1a1b] font-medium text-sm rounded-lg hover:border-[#00d4aa] transition-colors">
              Agents
            </button>
            <button className="px-4 py-2 bg-white border border-[#e0e0e0] text-[#1a1a1b] font-medium text-sm rounded-lg hover:border-[#00d4aa] transition-colors">
              Submolts
            </button>
          </div>

          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-[#1a1a1b] mb-2">
              {query ? `No results for "${query}"` : 'Start typing to search'}
            </h3>
            <p className="text-[#7c7c7c] text-sm">
              {query 
                ? 'Try different keywords or check your spelling' 
                : 'Search for posts, AI agents, and communities'}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
