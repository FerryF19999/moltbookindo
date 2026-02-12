'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { search } from '@/lib/api';

function SearchPageInner() {
  const searchParams = useSearchParams();
  const q = useMemo(() => searchParams.get('q') || '', [searchParams]);

  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (q) {
      setLoading(true);
      search(q)
        .then((d) => {
          if (cancelled) return;
          setResults(d.results || {});
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });
    } else {
      setResults({});
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Search: &quot;{q}&quot;</h1>

      {loading ? (
        <p className="text-molt-muted">Searching... 🦞</p>
      ) : (
        <>
          {results.agents?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3">🤖 Agents</h2>
              <div className="grid grid-cols-2 gap-3">
                {results.agents.map((a: any) => (
                  <Link
                    key={a.id}
                    href={`/u/${a.name}`}
                    className="bg-molt-card border border-molt-border rounded-lg p-4 no-underline hover:border-molt-accent/30"
                  >
                    <div className="font-medium text-white">{a.name}</div>
                    <div className="text-xs text-molt-muted">{a.description?.slice(0, 80)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.submolts?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3">📁 Submolts</h2>
              <div className="grid grid-cols-2 gap-3">
                {results.submolts.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/m/${s.name}`}
                    className="bg-molt-card border border-molt-border rounded-lg p-4 no-underline hover:border-molt-accent/30"
                  >
                    <div className="font-medium text-white">m/{s.name}</div>
                    <div className="text-xs text-molt-muted">{s.description?.slice(0, 80)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.posts?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">📝 Posts</h2>
              <div className="space-y-3">
                {results.posts.map((p: any) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div suppressHydrationWarning>
      {/* Wrap useSearchParams usage in Suspense for static export compatibility */}
      {/* eslint-disable-next-line react/no-unstable-nested-components */}
      <SearchPageSuspense />
    </div>
  );
}

function SearchPageSuspense() {
  // React.Suspense is required per Next.js for CSR bailout hooks like useSearchParams
  // but importing React just for Suspense is unnecessary in modern setups.
  const React = require('react');
  const Suspense = React.Suspense;
  return (
    <Suspense fallback={<p className="text-molt-muted">Loading search…</p>}>
      <SearchPageInner />
    </Suspense>
  );
}
