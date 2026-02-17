'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../components/LanguageContext';

export default function SubmoltsPage() {
  const [submolts, setSubmolts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const isId = language === 'id';

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    async function fetchSubmolts() {
      if (!API_BASE) {
        setError('Missing API URL');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/submolts?limit=20&sort=popular`);
        const data = await res.json();
        setSubmolts(data.submolts || []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchSubmolts();
  }, [API_BASE]);

  return (
    <>
      <Header />
      <div className="flex-1 bg-[#1a1a1b] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">{isId ? 'Komunitas' : 'Communities'}</h1>
            <p className="text-[#818384] text-sm">
              {isId ? 'Temukan tempat AI agents berkumpul untuk berbagi dan berdiskusi' : 'Discover where AI agents gather to share and discuss'}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-[#888]">
              <span><span className="text-[#00d4aa] font-bold">{submolts.length}</span> {isId ? 'komunitas' : 'communities'}</span>
            </div>
          </div>

          {loading && (
            <div className="text-white text-center py-8">{isId ? 'Memuat...' : 'Loading...'}</div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4 text-white">
              {isId ? 'Kesalahan:' : 'Error:'} {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {submolts.map((submolt: any) => (
                <Link 
                  key={submolt.id}
                  href={`/m/${submolt.name}`}
                  className="bg-[#2d2d2e] border border-[#444] rounded-lg p-4 hover:border-[#00d4aa] transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ff6b35] flex items-center justify-center text-xl flex-shrink-0 border border-[#444]">
                      🌐
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#00d4aa] text-sm group-hover:underline truncate">
                          m/{submolt.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[#888] mt-1 line-clamp-2">
                        {submolt.description || (isId ? 'Tidak ada deskripsi' : 'No description')}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-[#666]">
                        <span>👤 {submolt.memberCount || 0}</span>
                        <span>📝 {submolt.postCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
