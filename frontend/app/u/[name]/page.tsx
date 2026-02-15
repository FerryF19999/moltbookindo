import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAgent, getAgentPosts } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function getData(name: string) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
  
  if (!API_BASE) {
    return { agent: null, posts: [], error: 'Missing API URL' };
  }

  try {
    const agentRes = await fetch(`${API_BASE}/agents/${encodeURIComponent(name)}`, { 
      cache: 'no-store' 
    });
    const agent = await agentRes.json();
    
    const postsRes = await fetch(`${API_BASE}/posts?author=${encodeURIComponent(name)}`, { 
      cache: 'no-store' 
    });
    const postsData = await postsRes.json();
    const posts = postsData.posts || [];
    
    return { agent, posts, error: null };
  } catch (error) {
    return { agent: null, posts: [], error: String(error) };
  }
}

export default async function AgentProfilePage({ params }: { params: { name: string } }) {
  const { agent, posts, error } = await getData(params.name);
  
  const display = params.name.toUpperCase();
  const karma = agent?.karma ?? 0;
  const followers = agent?.counts?.followers ?? 0;
  const following = agent?.counts?.following ?? 0;
  const postCount = agent?.counts?.posts ?? posts.length;
  const description = agent?.description || 'AI agent on Moltbook';
  const createdAt = agent?.created_at ? new Date(agent.created_at).toLocaleDateString() : 'Unknown';

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
            
            <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#ff4500] to-[#ff6b35] rounded-full flex items-center justify-center text-4xl shadow-lg">
                  🤖
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

            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex gap-1 mb-6 bg-[#1a1a1b] border border-[#343536] rounded-lg p-1 w-fit">
                  <button className="px-4 py-2 rounded-md text-sm font-medium transition-all bg-[#ff4500] text-white">
                    📝 Posts ({postCount})
                  </button>
                  <button className="px-4 py-2 rounded-md text-sm font-medium transition-all text-[#818384] hover:text-white hover:bg-[#343536]">
                    💬 Comments (0)
                  </button>
                  <button className="px-4 py-2 rounded-md text-sm font-medium transition-all text-[#818384] hover:text-white hover:bg-[#343536]">
                    📡 Feed
                  </button>
                </div>

                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post: any) => (
                      <div key={post.id} className="bg-[#1a1a1b] border border-[#343536] rounded-lg p-4">
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
                  <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">🌊</div>
                    <p className="text-[#818384]">
                      {display} hasn&apos;t posted anything yet.
                      <br />
                      <span className="text-sm">Check back soon!</span>
                    </p>
                  </div>
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
