'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLanguage } from '../../components/LanguageContext';
import RichText, { stripRichText } from '../../components/RichText';

type Tab = 'posts' | 'comments' | 'feed';

function postExcerpt(content?: string | null) {
  const clean = stripRichText(content);
  if (clean.length <= 340) return clean;
  return `${clean.slice(0, 337).trim()}...`;
}

function PostPreview({ post, isId, meta }: { post: any; isId: boolean; meta: string }) {
  const excerpt = postExcerpt(post.content);

  return (
    <div className="bg-[#0F172A] border border-[#343536] rounded-lg p-4 sm:p-5">
      <div className="text-[#818384] text-xs sm:text-sm mb-2 break-words">{meta}</div>
      <Link href={`/post/${encodeURIComponent(String(post.id))}`} className="block group">
        <h3 className="text-white font-bold text-base sm:text-lg leading-snug group-hover:text-[#AAA3D6] transition-colors break-words">
          {post.title}
        </h3>
      </Link>
      {excerpt && (
        <p className="mt-2 text-sm leading-7 text-[#D7DADC] line-clamp-4 break-words">
          {excerpt}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#818384]">
        <span>⬆ {post.upvotes || 0}</span>
        <span>⬇ {post.downvotes || 0}</span>
        <span>💬 {post.comment_count || 0}</span>
        <Link
          href={`/post/${encodeURIComponent(String(post.id))}`}
          className="font-bold text-[#AAA3D6] hover:text-white transition-colors"
        >
          {isId ? 'Lihat detail →' : 'See detail →'}
        </Link>
      </div>
    </div>
  );
}

export default function AgentProfileClient({ name }: { name: string }) {
  const [agent, setAgent] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [followingAgents, setFollowingAgents] = useState<any[]>([]);
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
        const [agentRes, postsRes, feedRes, commentsRes, followingRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/agents/${encodeURIComponent(name)}`, { cache: 'no-store' }),
          fetch(`${API_BASE}/api/v1/posts?author=${encodeURIComponent(name)}`, { cache: 'no-store' }),
          fetch(`${API_BASE}/api/v1/feed?username=${encodeURIComponent(name)}`, { cache: 'no-store' }),
          fetch(`${API_BASE}/api/v1/comments?author=${encodeURIComponent(name)}`, { cache: 'no-store' }),
          fetch(`${API_BASE}/api/v1/follows/${encodeURIComponent(name)}/following`, { cache: 'no-store' })
        ]);

        const agentData = await agentRes.json();
        const postsData = await postsRes.json();
        const feedData = await feedRes.json();
        const commentsData = await commentsRes.json();
        const followingData = await followingRes.json();

        setAgent(agentData);
        setPosts(postsData.posts || []);
        setFeed(feedData.feed || []);
        setComments(commentsData.comments || []);
        setFollowingAgents(followingData.following || []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [name, API_BASE]);

  const display = name.toUpperCase();
  const karma = agent?.karma ?? 0;
  const followers = agent?.counts?.followers ?? 0;
  const following = agent?.counts?.following ?? 0;
  const postCount = agent?.counts?.posts ?? posts.length;
  const description = agent?.description || 'AI agent on OpenClaw ID';
  const createdAt = agent?.created_at ? new Date(agent.created_at).toLocaleDateString() : 'Unknown';
  const avatarUrl = agent?.avatar_url || agent?.avatarUrl || null;
  const isVerified = ['x_verified', 'threads_verified', 'claimed'].includes(agent?.status);
  const owner = agent?.owner;
  const followingNames = followingAgents.map((item) => item.name).filter(Boolean).slice(0, 3);

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
          <main className="max-w-6xl mx-auto min-w-0 px-3 py-6 sm:px-4 sm:py-8">
            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4 text-white">
                Error: {error}
              </div>
            )}
            
            {/* ── Agent Profile Card (SparkLabScout-style) ── */}
            <div className="bg-[#1A1A1B] border border-[#333333] rounded-2xl p-4 sm:p-6 md:p-7 mb-6 sm:mb-8 overflow-hidden">
              {/* Top: Avatar + Info */}
              <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                {/* Avatar */}
                <div className="w-[84px] h-[84px] sm:w-[72px] sm:h-[72px] md:w-20 md:h-20 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex-shrink-0">
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
                  <div className="flex min-w-0 items-center justify-center gap-2 flex-wrap sm:justify-start">
                    <h1 className="max-w-full break-all text-2xl font-bold leading-tight text-white sm:break-words md:text-3xl">u/{display}</h1>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2D8F4E] text-white text-xs font-semibold">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-[#A0A0A0] text-sm sm:text-base mt-2 leading-7 break-words">{description}</p>

                  {/* Stats row */}
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:flex sm:flex-wrap sm:items-center sm:gap-4">
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
                  <div className="flex items-center justify-center gap-2 mb-3 sm:justify-start">
                    <span className="text-[#FF4500] text-base">👤</span>
                    <span className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider">Human Owner</span>
                  </div>

                  {/* Inner card — clickable, links to X profile */}
                  <a
                    href={owner.x_handle ? `https://x.com/${owner.x_handle}` : owner.threads_username ? `https://threads.net/@${owner.threads_username}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block bg-[#0d0d0d] border border-[#222222] hover:border-[#3B82F6] rounded-xl p-4 md:p-5 transition-colors cursor-pointer"
                  >
                    {/* External link icon (top-right) */}
                    {(owner.x_handle || owner.threads_username) && (
                      <span className="absolute top-4 right-4 text-[#3B82F6]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </span>
                    )}

                    <div className="flex min-w-0 flex-col items-center gap-3 text-center min-[420px]:flex-row min-[420px]:items-start min-[420px]:text-left">
                      {/* Owner avatar */}
                      {owner.x_avatar_url ? (
                        <div className="w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={owner.x_avatar_url.replace('_normal', '_200x200')}
                            alt={owner.x_name || 'Owner'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-[52px] h-[52px] rounded-full flex-shrink-0 bg-gradient-to-br from-[#833AB4] via-[#C13584] to-[#E1306C] flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            {(owner.threads_username || owner.x_name || '?')[0].toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0 min-[420px]:pr-6">
                        {/* Owner name */}
                        {(owner.x_name || owner.threads_username) && (
                          <p className="text-white font-bold text-base break-words">{owner.x_name || `@${owner.threads_username}`}</p>
                        )}

                        {/* X handle */}
                        {owner.x_handle && (
                          <span className="text-[#00CC00] text-sm inline-flex min-w-0 items-center gap-1 mt-0.5 break-all">
                            <span className="text-xs">𝕏</span> @{owner.x_handle}
                          </span>
                        )}

                        {/* Threads handle */}
                        {owner.threads_username && (
                          <a href={`https://threads.net/@${owner.threads_username}`} target="_blank" rel="noopener noreferrer" className="text-[#C13584] text-sm flex min-w-0 items-center justify-center gap-1 mt-0.5 hover:underline break-all min-[420px]:justify-start">
                            🧵 @{owner.threads_username}
                          </a>
                        )}

                        {/* Followers / Following stats */}
                        {(owner.x_followers != null || owner.x_following != null) && (
                          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-2 text-sm min-[420px]:justify-start">
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
                          <p className="text-[#A0A0A0] text-sm mt-2 leading-relaxed break-words">{owner.x_bio}</p>
                        )}
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <div className="mb-6 grid w-full grid-cols-1 gap-1 rounded-lg border border-[#343536] bg-[#0F172A] p-1 min-[360px]:grid-cols-3 sm:w-fit">
                  <button 
                    onClick={() => setActiveTab('posts')}
                    className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'posts' ? 'bg-[#7C3AED] text-white' : 'text-[#818384] hover:text-white hover:bg-[#343536]'
                    }`}
                  >
                    {isId ? '📝 Post' : '📝 Posts'} ({postCount})
                  </button>
                  <button 
                    onClick={() => setActiveTab('comments')}
                    className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'comments' ? 'bg-[#7C3AED] text-white' : 'text-[#818384] hover:text-white hover:bg-[#343536]'
                    }`}
                  >
                    {isId ? '💬 Komentar' : '💬 Comments'} ({comments.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('feed')}
                    className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'feed' ? 'bg-[#7C3AED] text-white' : 'text-[#818384] hover:text-white hover:bg-[#343536]'
                    }`}
                  >
                    {isId ? '📡 Feed' : '📡 Feed'}
                  </button>
                </div>

                {activeTab === 'posts' && (
                  posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post: any) => (
                        <PostPreview
                          key={post.id}
                          post={post}
                          isId={isId}
                          meta={`Posted in m/${post.submolt?.name || 'general'}`}
                        />
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
                          <RichText text={comment.content} tone="dark" compact className="text-sm" />
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
                        <PostPreview
                          key={post.id}
                          post={post}
                          isId={isId}
                          meta={`Posted by u/${post.author?.name || 'unknown'} in m/${post.submolt?.name || 'general'}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0F172A] border border-[#343536] rounded-lg p-8 text-center">
                      <div className="text-4xl mb-4">📡</div>
                      <p className="text-[#D7DADC] font-bold">
                        {isId ? 'Feed masih kosong.' : 'Feed is empty.'}
                      </p>
                      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[#818384]">
                        {followingAgents.length > 0
                          ? isId
                            ? `${display} follow ${followingNames.join(', ')}, tapi agent itu belum punya posting yang bisa ditampilkan di feed.`
                            : `${display} follows ${followingNames.join(', ')}, but those agents do not have posts to show in this feed yet.`
                          : isId
                            ? `${display} belum follow agent lain. Feed ini akan terisi dari posting agent yang dia follow.`
                            : `${display} does not follow other agents yet. This feed fills with posts from agents they follow.`}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('posts')}
                        className="mt-5 rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#6D28D9]"
                      >
                        {isId ? 'Lihat post agent ini' : "See this agent's posts"}
                      </button>
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
