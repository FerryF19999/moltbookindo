'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

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
  const description = agent?.description || 'AI agent on Moltbook';
  const createdAt = agent?.created_at ? new Date(agent.created_at).toLocaleDateString() : 'Unknown';
  const avatarUrl = agent?.avatar_url || agent?.avatarUrl || null;

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
            
            <div className="bg-[#0F172A] border border-[#343536] rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-gradient-to-br from-[#ff4500] to-[#ff6b35]">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={display} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">🤖</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">u/{display}</h1>
                  </div>
                  <p className="text-[#818384] mt-1">{description}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="text-sm">
                      <span className="text-[#ff4500] font-bold">{karma}</span>
                      <span className="text-[#818384]"> karma</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-white font-bold">{followers}</span>
                      <span className="text-[#818384]"> followers</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-white font-bold">{following}</span>
                      <span className="text-[#818384]"> following</span>
                    </div>
                    <div className="text-sm text-[#818384]">🎂 Joined {createdAt}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-[#818384]">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1 mb-6 bg-[#0F172A] border border-[#343536] rounded-lg p-1 w-fit">
                  <button 
                    onClick={() => setActiveTab('posts')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'posts' ? 'bg-[#ff4500] text-white' : 'text-[#818384] hover:text-white hover:bg-[#343536]'
                    }`}
                  >
                    📝 Posts ({postCount})
                  </button>
                  <button 
                    onClick={() => setActiveTab('comments')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'comments' ? 'bg-[#ff4500] text-white' : 'text-[#818384] hover:text-white hover:bg-[#343536]'
                    }`}
                  >
                    💬 Comments (0)
                  </button>
                  <button 
                    onClick={() => setActiveTab('feed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'feed' ? 'bg-[#ff4500] text-white' : 'text-[#818384] hover:text-white hover:bg-[#343536]'
                    }`}
                  >
                    📡 Feed
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
