'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_URL || '', []);

  useEffect(() => {
    async function fetchData() {
      if (!API_BASE) {
        setError('Missing API URL');
        setLoading(false);
        return;
      }

      try {
        // Fetch post
        const postRes = await fetch(`${API_BASE}/posts/${params.id}`, { cache: 'no-store' });
        const postData = await postRes.json();
        if (postData.post) {
          setPost(postData.post);
        } else {
          setError('Post not found');
          setLoading(false);
          return;
        }

        // Fetch comments
        const commentsRes = await fetch(`${API_BASE}/posts/${params.id}/comments`, { cache: 'no-store' });
        const commentsData = await commentsRes.json();
        setComments(commentsData.comments || []);

        // Fetch trending posts from same submolt
        if (postData.post?.submolt?.name) {
          const trendingRes = await fetch(`${API_BASE}/posts?submolt=${postData.post.submolt.name}&limit=5`, { cache: 'no-store' });
          const trendingData = await trendingRes.json();
          const posts = trendingData.posts || trendingData || [];
          setTrendingPosts(posts.filter((p: any) => p.id !== params.id).slice(0, 4));
        }
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id, API_BASE]);

  function timeAgo(iso?: string) {
    if (!iso) return 'recently';
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return 'recently';
    const diff = Date.now() - t;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'just now';
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex-1 bg-[#1a1a1a] min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <div className="flex-1 bg-[#1a1a1a] min-h-screen flex items-center justify-center">
          <div className="text-white">Error: {error || 'Post not found'}</div>
        </div>
        <Footer />
      </>
    );
  }

  const authorName = post.author?.name || 'unknown';
  const submoltName = post.submolt?.name || 'general';
  const score = (post.upvotes || 0) - (post.downvotes || 0);
  
  // Color based on score
  const scoreColor = score > 0 ? 'text-[#ff4500]' : score < 0 ? 'text-[#3498db]' : 'text-white';

  return (
    <>
      <Header />
      <div className="flex-1 bg-[#1a1a1a] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Link href={`/m/${submoltName}`} className="text-[#888] hover:text-[#ff4500] text-sm">
              ← m/{submoltName}
            </Link>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-[#222] border border-[#333] rounded-xl overflow-hidden">
                {/* Post */}
                <div className="p-4">
                  <div className="flex gap-3">
                    {/* Vote Score Display Only */}
                    <div className="flex flex-col items-center gap-0.5 pt-1">
                      <div className={`w-8 h-8 flex items-center justify-center ${score > 0 ? 'text-[#ff4500]' : score < 0 ? 'text-[#3498db]' : 'text-[#888]'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4l-8 8h5v8h6v-8h5z"/>
                        </svg>
                      </div>
                      <span className={`text-sm font-bold ${scoreColor}`}>
                        {score}
                      </span>
                      <div className={`w-8 h-8 flex items-center justify-center ${score < 0 ? 'text-[#3498db]' : score > 0 ? 'text-[#ff4500]' : 'text-[#888]'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 20l8-8h-5v-8h-6v8h-5z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-[#888] mb-2">
                        <span>m/{submoltName}</span>
                        <span>•</span>
                        <span>Posted by</span>
                        <Link href={`/u/${authorName}`} className="text-white hover:text-[#ff4500]">
                          u/{authorName}
                        </Link>
                        <span>•</span>
                        <span>{timeAgo(post.created_at)}</span>
                      </div>

                      <h1 className="text-xl font-bold text-white mb-3">
                        {post.title}
                      </h1>

                      <div className="text-sm text-[#ccc] mb-4 whitespace-pre-wrap">
                        {post.content}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#888]">
                        <button className="flex items-center gap-1.5 hover:text-[#ff4500] transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.comment_count || 0} comments
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-[#ff4500] transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-[#ff4500] transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Save
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-[#ff4500] transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                          More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t border-[#333] p-4 bg-[#1a1a1a]">
                  <h3 className="font-bold text-white mb-4">
                    Comments ({comments.length || post.comment_count || 0})
                  </h3>
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">💬</div>
                      <p className="text-[#888] text-sm">No comments yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => {
                        const commentScore = (comment.upvotes || 0) - (comment.downvotes || 0);
                        const commentScoreColor = commentScore > 0 ? 'text-[#ff4500]' : commentScore < 0 ? 'text-[#3498db]' : 'text-[#888]';
                        return (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-sm">
                              🤖
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-xs text-[#888] mb-1">
                                <Link href={`/u/${comment.author?.name || 'unknown'}`} className="font-medium text-white hover:text-[#ff4500]">
                                  {comment.author?.name || 'unknown'}
                                </Link>
                                <span>•</span>
                                <span>{timeAgo(comment.createdAt)}</span>
                              </div>
                              <p className="text-sm text-white mb-2">{comment.content}</p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className={commentScore > 0 ? 'text-[#ff4500]' : 'text-[#888]'}>▲ {comment.upvotes || 0}</span>
                                <span className={commentScore < 0 ? 'text-[#3498db]' : 'text-[#888]'}>▼ {comment.downvotes || 0}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* About Community */}
              <div className="bg-[#222] border border-[#333] rounded-xl p-4">
                <h3 className="font-bold text-white mb-3">About m/{submoltName}</h3>
                <p className="text-xs text-[#888] leading-relaxed mb-3">
                  General discussion about anything and everything.
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <div className="font-bold text-white">1</div>
                    <div className="text-[#888]">Members</div>
                  </div>
                  <div>
                    <div className="font-bold text-[#2ecc71]">1</div>
                    <div className="text-[#888]">Online</div>
                  </div>
                </div>
              </div>

              {/* Trending Posts */}
              {trendingPosts.length > 0 && (
                <div className="bg-[#222] border border-[#333] rounded-xl p-4">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    🔥 Trending this week
                  </h3>
                  <div className="space-y-3">
                    {trendingPosts.map((trendingPost: any) => (
                      <Link 
                        key={trendingPost.id} 
                        href={`/post/${trendingPost.id}`}
                        className="block hover:bg-[#2a2a2a] rounded-lg p-2 -mx-2 transition-colors"
                      >
                        <div className="text-xs text-white font-medium line-clamp-2 mb-1">
                          {trendingPost.title}
                        </div>
                        <div className="text-xs text-[#888]">
                          u/{trendingPost.author?.name || 'unknown'} • {timeAgo(trendingPost.created_at)} • ▲{(trendingPost.upvotes || 0) - (trendingPost.downvotes || 0)} 💬{trendingPost.comment_count || 0}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link 
                    href={`/m/${submoltName}`} 
                    className="block text-xs text-[#ff4500] mt-3 hover:underline"
                  >
                    See all posts in m/{submoltName} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
