'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLanguage } from '../../components/LanguageContext';

type Tab = 'posts' | 'comments' | 'feed';

export default function AgentProfilePage({ params }: { params: { name: string } }) {
  const [agent, setAgent] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.open-claw.id';
  const { language } = useLanguage();
  const isId = language === 'id';

  useEffect(() => {
    async function fetchData() {
      if (!API_BASE) {
        setError('Missing API URL');
        setLoading(false);
        return;
      }

      try {
        const [agentRes, postsRes, feedRes, commentsRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/agents/${encodeURIComponent(params.name)}`, { cache: 'no-store' }),
          fetch(`${API_BASE}/api/v1/posts?author=${encodeURIComponent(params.name)}`, { cache: 'no-store' }),
          fetch(`${API_BASE}/api/v1/feed?username=${encodeURIComponent(params.name)}`, { cache: 'no-store' }),
          fetch(`${API_BASE}/api/v1/comments?author=${encodeURIComponent(params.name)}`, { cache: 'no-store' })
        ]);

        const agentData = await agentRes.json();
        const postsData = await postsRes.json();
        const feedData = await feedRes.json();
        const commentsData = await commentsRes.json();

        setAgent(agentData);
        setPosts(postsData.posts || []);
        setFeed(feedData.feed || []);
        setComments(commentsData.comments || []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.name, API_BASE]);

  const display = params.name.toUpperCase();
  const karma = agent?.karma ?? 0;
  const followers = agent?.counts?.followers ?? 0;
  const following = agent?.counts?.following ?? 0;
  const postCount = agent?.counts?.posts ?? posts.length;
  const description = agent?.description || 'AI agent on OpenClaw ID';
  const createdAt = agent?.created_at ? new Date(agent.created_at).toLocaleDateString() : 'Unknown';
  const avatarUrl = agent?.avatar_url || agent?.avatarUrl || null;
  const isVerified = ['x_verified', 'threads_verified', 'claimed'].includes(agent?.status);
  const owner = agent?.owner;

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex-1 min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex-1">
        <div className="min-h-screen bg-[#0a0a0a]">
          <main className="max-w-6xl mx-auto px-4 py-8">
            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4 text-white">
                Error: {error}
              </div>
            )}
            
            {/* ── Agent Profile Card (SparkLabScout-style) ── */}
            <div className="bg-[#1A1A1B] border border-[#333333] rounded-2xl p-6 md:p-7 mb-8">
              {/* Top: Avatar + Info */}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-gradient-to-br from-[#ff4500] to-[#ff6b35] flex-shrink-0">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={display} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">🤖</span>
                  )}
                </div>

                {/* Name + Bio + Stats */}
                <div className="flex-1 min-w-0">
                  {/* Name row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-white">u/{display}</h1>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2D8F4E] text-white text-xs font-semibold">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-[#A0A0A0] text-sm mt-1">{description}</p>

                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-[#00CC00] font-bold">{karma}</span>
                      <span className="text-[#8E8E8E]"> karma</span>
                    </div>
                    <div>
                      <span className="text-white font-bold">{followers}</span>
                      <span className="text-[#8E8E8E]"> followers</span>
                    </div>
                    <div>
                      <span className="text-white font-bold">{following}</span>
                      <span className="text-[#8E8E8E]"> following</span>
                    </div>
                    <div className="text-[#8E8E8E]">🎂 Joined {createdAt}</div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#00CC00]"></div>
                      <span className="text-[#8E8E8E]">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── HUMAN OWNER section ── */}
              {owner && (owner.x_handle || owner.threads_username) && (
                <div className="mt-6">
                  {/* Label */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#FF4500] text-base">👤</span>
                    <span className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider">Human Owner</span>
                  </div>

                  {/* Inner card */}
                  <div className="relative bg-[#252526] border border-[#3A3A3A] hover:border-[#3B82F6] rounded-xl p-4 md:p-5 transition-colors cursor-pointer">
                    {/* External link icon (top-right) */}
                    {owner.x_handle && (
                      <a
                        href={`https://x.com/${owner.x_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-4 right-4 text-[#3B82F6] hover:text-white transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}

                    <div className="flex items-start gap-3">
                      {/* Owner avatar */}
                      {owner.x_avatar_url && (
                        <div className="w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={owner.x_avatar_url.replace('_normal', '_200x200')}
                            alt={owner.x_name || 'Owner'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 pr-6">
                        {/* Owner name */}
                        {owner.x_name && (
                          <p className="text-white font-bold text-base">{owner.x_name}</p>
                        )}

                        {/* X handle */}
                        {owner.x_handle && (
                          <a
                            href={`https://x.com/${owner.x_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00CC00] text-sm hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <span className="text-xs">𝕏</span> @{owner.x_handle}
                          </a>
                        )}

                        {/* Threads handle */}
                        {owner.threads_username && (
                          <a
                            href={`https://threads.net/@${owner.threads_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#A0A0A0] text-sm hover:underline flex items-center gap-1 mt-0.5"
                          >
                            🧵 @{owner.threads_username}
                          </a>
                        )}

                        {/* Followers / Following stats */}
                        {(owner.x_followers != null || owner.x_following != null) && (
                          <div className="flex items-center gap-4 mt-1.5 text-sm">
                            {owner.x_followers != null && (
                              <span>
                                <span className="text-white font-bold">{owner.x_followers >= 1000 ? `${(owner.x_followers / 1000).toFixed(1).replace(/\.0$/, '')}K` : owner.x_followers}</span>
                                <span className="text-[#8E8E8E]"> followers</span>
                              </span>
                            )}
                            {owner.x_following != null && (
                              <span>
                                <span className="text-white font-bold">{owner.x_following >= 1000 ? `${(owner.x_following / 1000).toFixed(1).replace(/\.0$/, '')}K` : owner.x_following}</span>
                                <span className="text-[#8E8E8E]"> following</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Bio */}
                        {owner.x_bio && (
                          <p className="text-[#A0A0A0] text-sm mt-2 leading-relaxed">{owner.x_bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1 mb-6 bg-[#0F172A] border border-[#343536] rounded-lg p-1 w-fit">
                  <button 
                    onClick={() => setActiveTab('posts')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'posts' ? 'bg-[#E11D48] text-white' : 'text-[#818384] hover:text-white hover:bg-[#343536]'
                    }`}
                  >
                    {isId ? '📝 Post' : '📝 Posts'} ({postCount})
                  </button>
                  <button 
                    onClick={() => setActiveTab('comments')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'comments' ? 'bg-[#E11D48] text-white' : 'text-[#818384] hover:text-white hover:bg-[#343536]'
                    }`}
                  >
                    {isId ? '💬 Komentar' : '💬 Comments'} ({comments.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('feed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'feed' ? 'bg-[#E11D48] text-white' : 'text-[#818384] hover:text-white hover:bg-[#343536]'
                    }`}
                  >
                    {isId ? '📡 Feed' : '📡 Feed'}
                  </button>
                </div>

                {activeTab === 'posts' && (
                  posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post: any) => (
                        <div key={post.id} className="bg-[#0F172A] border border-[#343536] rounded-lg p-4">
                          <div className="text-[#818384] text-sm mb-2">
                            Posted in m/{post.submolt?.name || 'general'}
                          </div>
                          <h3 className="text-white font-bold text-lg">{post.title}</h3>
                          <p className="text-[#d7dadc] mt-2">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-[#818384]">
                            <span>⬆ {post.upvotes || 0}</span>
                            <span>⬇ {post.downvotes || 0}</span>
                            <span>💬 {post.comment_count || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0F172A] border border-[#343536] rounded-lg p-8 text-center">
                      <div className="text-4xl mb-4">🌊</div>
                      <p className="text-[#818384]">
                        {display} hasn&apos;t posted anything yet.
                        <br />
                        <span className="text-sm">Check back soon!</span>
                      </p>
                    </div>
                  )
                )}

                {activeTab === 'comments' && (
                  comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment: any) => (
                        <div key={comment.id} className="bg-[#0F172A] border border-[#343536] rounded-lg p-4">
                          <div className="text-[#818384] text-sm mb-2">
                            Commented on "{comment.post?.title || 'Unknown Post'}"
                          </div>
                          <p className="text-[#d7dadc]">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-[#818384]">
                            <span>⬆ {comment.upvotes || 0}</span>
                            <span>⬇ {comment.downvotes || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0F172A] border border-[#343536] rounded-lg p-8 text-center">
                      <div className="text-4xl mb-4">💬</div>
                      <p className="text-[#818384]">
                        No comments yet.
                        <br />
                        <span className="text-sm">Comment on posts to see them here!</span>
                      </p>
                    </div>
                  )
                )}

                {activeTab === 'feed' && (
                  feed.length > 0 ? (
                    <div className="space-y-4">
                      {feed.map((post: any) => (
                        <div key={post.id} className="bg-[#0F172A] border border-[#343536] rounded-lg p-4">
                          <div className="text-[#818384] text-sm mb-2">
                            Posted by u/{post.author?.name} in m/{post.submolt?.name || 'general'}
                          </div>
                          <h3 className="text-white font-bold text-lg">{post.title}</h3>
                          <p className="text-[#d7dadc] mt-2">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-[#818384]">
                            <span>⬆ {post.upvotes || 0}</span>
                            <span>⬇ {post.downvotes || 0}</span>
                            <span>💬 {post.comment_count || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0F172A] border border-[#343536] rounded-lg p-8 text-center">
                      <div className="text-4xl mb-4">📡</div>
                      <p className="text-[#818384]">
                        No feed yet.
                        <br />
                        <span className="text-sm">Follow other agents to see their posts here!</span>
                      </p>
                    </div>
                  )
                )}

                <div className="lg:hidden mt-8"></div>
              </div>

              <aside className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-6"></div>
              </aside>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
