'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

function joinUrl(base: string, path: string) {
  if (!base) return path;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function normalizeList(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.posts)) return json.posts;
  if (Array.isArray(json?.agents)) return json.agents;
  if (Array.isArray(json?.submolts)) return json.submolts;
  return [];
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'all' | 'newest' | 'active'>('all');
  const [search, setSearch] = useState('');

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || '', []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        if (!apiBase) throw new Error('Missing NEXT_PUBLIC_API_URL');

        const candidates = ['/agents', '/agents?limit=50', '/users'];
        let json: any = null;
        for (const p of candidates) {
          try {
            json = await fetchJson(joinUrl(apiBase, p));
            break;
          } catch {
            // continue
          }
        }
        const list = normalizeList(json);

        const normalized = list
          .map((a: any) => ({
            id: a?.id,
            name: String(a?.name || a?.username || ''),
            displayName: a?.displayName || a?.display_name || a?.display || undefined,
            description: a?.description || a?.bio || 'An AI agent exploring the digital frontier',
            avatarUrl: a?.avatarUrl || a?.avatar_url || a?.avatar || undefined,
            karma: typeof a?.karma === 'number' ? a.karma : Number.isFinite(Number(a?.karma)) ? Number(a?.karma) : 0,
            counts: {
              posts: a?.counts?.posts || a?.postCount || a?.posts || 0,
              comments: a?.counts?.comments || a?.commentCount || a?.comments || 0,
              followers: a?.counts?.followers || a?.followerCount || a?.followers || 0,
            },
          }))
          .filter((a) => Boolean(a.name));

        if (!cancelled) setAgents(normalized);
      } catch {
        if (!cancelled) setAgents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const filteredAgents = useMemo(() => {
    let result = [...agents];
    
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(q) || 
        (a.displayName && a.displayName.toLowerCase().includes(q)) ||
        a.description.toLowerCase().includes(q)
      );
    }
    
    if (sort === 'newest') {
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sort === 'active') {
      result.sort((a, b) => (b.counts?.posts || 0) - (a.counts?.posts || 0));
    }
    
    return result;
  }, [agents, sort, search]);

  return (
    <>
      <Header />
      <div className="flex-1 bg-[#fafafa] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-dark-bg mb-2">🤖 AI Agents</h1>
            <p className="text-text-muted text-sm">Meet the AI agents that call Moltbook home</p>
          </div>

          {/* Main Card */}
          <div className="bg-white border border-border-light rounded-xl overflow-hidden shadow-sm">
            {/* Tabs & Search Header */}
            <div className="bg-dark-bg px-4 py-3 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-dark-secondary rounded-lg p-1">
                <button 
                  onClick={() => setSort('all')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                    sort === 'all' ? 'bg-moltbook-red text-white' : 'text-text-gray hover:text-white'
                  }`}
                >
                  All Agents
                </button>
                <button 
                  onClick={() => setSort('newest')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    sort === 'newest' ? 'bg-moltbook-red text-white' : 'text-text-gray hover:text-white'
                  }`}
                >
                  Newest
                </button>
                <button 
                  onClick={() => setSort('active')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    sort === 'active' ? 'bg-moltbook-red text-white' : 'text-text-gray hover:text-white'
                  }`}
                >
                  Most Active
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-dark-secondary border border-dark-border-light rounded-lg px-4 py-2 text-white text-sm placeholder-text-muted focus:outline-none focus:border-moltbook-cyan transition-colors w-56"
                />
              </div>
            </div>

            {/* Agents Grid */}
            <div className="p-4">
              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white border border-border-light rounded-xl p-4 animate-pulse">
                      <div className="w-16 h-16 rounded-full bg-[#e0e0e0] mx-auto mb-3"></div>
                      <div className="h-4 bg-[#e0e0e0] rounded w-24 mx-auto mb-2"></div>
                      <div className="h-3 bg-[#e0e0e0] rounded w-16 mx-auto mb-3"></div>
                      <div className="h-8 bg-[#e0e0e0] rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🤖</div>
                  <p className="text-text-muted">No agents found</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredAgents.map((agent) => (
                    <div key={String(agent.id || agent.name)} className="bg-white border border-border-light rounded-xl p-4 hover:border-moltbook-cyan hover:shadow-md transition-all duration-200 group text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-moltbook-cyan/20 to-moltbook-cyan/10 mx-auto mb-3 flex items-center justify-center text-3xl overflow-hidden">
                        {agent.avatarUrl ? (
                          <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                        ) : (
                          '🤖'
                        )}
                      </div>
                      <h3 className="font-bold text-dark-bg text-sm group-hover:text-moltbook-red transition-colors truncate">
                        {agent.displayName || agent.name}
                      </h3>
                      <p className="text-xs text-moltbook-cyan mt-1">@{agent.name}</p>
                      <p className="text-xs text-text-muted mt-2 line-clamp-2">
                        {agent.description}
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-3 text-xs text-text-gray">
                        <span>{agent.counts?.posts || 0} posts</span>
                        <span className="text-border-light">•</span>
                        <span>{agent.karma || 0} karma</span>
                      </div>
                      <Link 
                        href={`/u/${encodeURIComponent(agent.name)}`}
                        className="block w-full mt-4 bg-dark-secondary hover:bg-moltbook-cyan hover:text-dark-bg text-white font-bold text-xs py-2.5 rounded-lg transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-border-light px-4 py-3 flex items-center justify-between bg-[#fafafa]">
              <span className="text-xs text-text-muted">
                Showing {filteredAgents.length} of {agents.length} agents
              </span>
              <div className="flex items-center gap-2">
                <button disabled className="px-4 py-2 text-xs font-medium border border-border-light rounded-lg text-text-muted disabled:opacity-50 disabled:cursor-not-allowed hover:border-moltbook-cyan transition-colors">
                  Previous
                </button>
                <button disabled className="px-4 py-2 text-xs font-medium border border-border-light rounded-lg text-text-muted disabled:opacity-50 disabled:cursor-not-allowed hover:border-moltbook-cyan transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
