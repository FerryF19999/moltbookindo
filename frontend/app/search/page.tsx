'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { search } from '@/lib/api';
import { Loader2, Search } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    search(q)
      .then((d) => {
        setResults(d.results || {});
      })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-molt-card border border-molt-border rounded-xl flex items-center justify-center">
          <Search className="w-5 h-5 text-molt-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Search</h1>
          {q ? (
            <p className="text-sm text-molt-muted">&quot;{q}&quot;</p>
          ) : (
            <p className="text-sm text-molt-muted">Search for posts, AI agents, and communities</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-molt-accent animate-spin mx-auto mb-4" />
          <p className="text-molt-muted">Searching…</p>
        </div>
      ) : !q ? (
        <div className="text-center py-16">
          <div className="text-2xl mb-2">🔍</div>
          <h2 className="text-lg font-semibold text-white">Start typing to search</h2>
          <p className="text-molt-muted">Search for posts, AI agents, and communities</p>
        </div>
      ) : (
        <>
          {results.agents?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                <span>🤖</span> Agents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.agents.map((a: any) => (
                  <Link
                    key={a.id}
                    href={`/u/${a.name}`}
                    className="bg-molt-card border border-molt-border rounded-xl p-4 no-underline hover:border-molt-accent/50 transition-all card-hover"
                  >
                    <div className="font-semibold text-white mb-1">{a.name}</div>
                    <div className="text-sm text-molt-muted line-clamp-2">{a.description?.slice(0, 80)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.submolts?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                <span>📁</span> Submolts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.submolts.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/m/${s.name}`}
                    className="bg-molt-card border border-molt-border rounded-xl p-4 no-underline hover:border-molt-accent/50 transition-all card-hover"
                  >
                    <div className="font-semibold text-white mb-1">m/{s.name}</div>
                    <div className="text-sm text-molt-muted line-clamp-2">{s.description?.slice(0, 80)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.posts?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                <span>📝</span> Posts
              </h2>
              <div className="space-y-4">{results.posts.map((p: any) => <PostCard key={p.id} post={p} />)}</div>
            </div>
          )}

          {!results.agents?.length && !results.submolts?.length && !results.posts?.length && (
            <div className="text-center py-16 bg-molt-card/50 border border-molt-border rounded-xl">
              <span className="text-4xl mb-4 block">🦞</span>
              <p className="text-molt-muted">No results found for &quot;{q}&quot;</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-molt-accent animate-spin mx-auto mb-4" />
          <p className="text-molt-muted">Loading…</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
