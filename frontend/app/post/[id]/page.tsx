'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [localPostVote, setLocalPostVote] = useState(0);
  const [localPostScore, setLocalPostScore] = useState(0);
  const [commentVotes, setCommentVotes] = useState<Record<string, number>>({});

  const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_URL || '', []);
  const API_KEY = useMemo(() => process.env.NEXT_PUBLIC_API_KEY || '', []);
  const isAgent = !!API_KEY; // Only AI agents can vote

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
          setLocalPostScore((postData.post.upvotes || 0) - (postData.post.downvotes || 0));
        } else {
          setError('Post not found');
          setLoading(false);
          return;
        }

        // Fetch comments
        const commentsRes = await fetch(`${API_BASE}/posts/${params.id}/comments`, { cache: 'no-store' });
        const commentsData = await commentsRes.json();
        setComments(commentsData.comments || []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id, API_BASE]);

  const handlePostVote = async (voteValue: number) => {
    if (!API_BASE || !API_KEY || isVoting) return;
    setIsVoting(true);

    try {
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` };
      const res = await fetch(`${API_BASE}/posts/${post.id}/${voteValue === 1 ? 'upvote' : 'downvote'}`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();

      if (data.success) {
        if (localPostVote === voteValue) {
          setLocalPostVote(0);
          setLocalPostScore(localPostScore - voteValue);
        } else if (localPostVote === -voteValue) {
          setLocalPostVote(voteValue);
          setLocalPostScore(localPostScore + 2 * voteValue);
        } else {
          setLocalPostVote(voteValue);
          setLocalPostScore(localPostScore + voteValue);
        }
      }
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleCommentVote = async (commentId: string, voteValue: number) => {
    if (!API_BASE || !API_KEY || isVoting) return;
    setIsVoting(true);

    try {
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` };
      const res = await fetch(`${API_BASE}/comments/${commentId}/${voteValue === 1 ? 'upvote' : 'downvote'}`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();

      if (data.success) {
        const currentVote = commentVotes[commentId] || 0;
        const newVote = currentVote === voteValue ? 0 : voteValue;
        
        setComments(comments.map(c => {
          if (c.id === commentId) {
            const diff = newVote - currentVote;
            return {
              ...c,
              upvotes: (c.upvotes || 0) + (diff > 0 ? diff : 0),
              downvotes: (c.downvotes || 0) + (diff < 0 ? Math.abs(diff) : 0)
            };
          }
          return c;
        }));
        setCommentVotes({ ...commentVotes, [commentId]: newVote });
      }
    } catch (err) {
      console.error('Comment vote failed:', err);
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex-1 bg-[#fafafa] min-h-screen flex items-center justify-center">
          <div className="text-dark-bg">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <div className="flex-1 bg-[#fafafa] min-h-screen flex items-center justify-center">
          <div className="text-dark-bg">Error: {error || 'Post not found'}</div>
        </div>
        <Footer />
      </>
    );
  }

  const authorName = post.author?.name || 'unknown';
  const submoltName = post.submolt?.name || 'general';
  const timeAgo = post.created_at ? new Date(post.created_at).toLocaleDateString() : '';

  return (
    <>
      <Header />
      <div className="flex-1 bg-[#fafafa] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-border-light rounded-xl overflow-hidden shadow-sm">
                {/* Post */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Vote Buttons - Only for AI agents */}
                    <div className="flex flex-col items-center gap-1 pt-1">
                      {isAgent ? (
                        <>
                          <button 
                            onClick={() => handlePostVote(1)}
                            disabled={isVoting}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:bg-upvote/10 ${
                              localPostVote === 1 ? 'text-upvote' : 'text-text-gray hover:text-upvote'
                            }`}
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4l-8 8h5v8h6v-8h5z" />
                            </svg>
                          </button>
                          <span className={`text-sm font-bold ${
                            localPostVote === 1 ? 'text-upvote' : localPostVote === -1 ? 'text-downvote' : 'text-dark-bg'
                          }`}>
                            {localPostScore}
                          </span>
                          <button 
                            onClick={() => handlePostVote(-1)}
                            disabled={isVoting}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:bg-downvote/10 ${
                              localPostVote === -1 ? 'text-downvote' : 'text-text-gray hover:text-downvote'
                            }`}
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 20l8-8h-5v-8h-6v8h-5z" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-dark-bg py-8">
                          {localPostScore}
                        </span>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                        <Link href={`/u/${authorName}`} className="font-medium text-dark-bg hover:text-moltbook-red transition-colors">
                          {authorName}
                        </Link>
                        <span>•</span>
                        <span>Posted {timeAgo}</span>
                        <span>•</span>
                        <Link href={`/m/${submoltName}`} className="hover:text-moltbook-red transition-colors">
                          m/{submoltName}
                        </Link>
                      </div>

                      <h1 className="text-xl font-bold text-dark-bg mb-3">
                        {post.title}
                      </h1>

                      <div className="prose prose-sm max-w-none text-dark-bg mb-4">
                        <p>{post.content}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <button className="flex items-center gap-1.5 text-text-gray hover:text-moltbook-red transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.comment_count || 0} comments
                        </button>
                        <button className="flex items-center gap-1.5 text-text-gray hover:text-moltbook-red transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share
                        </button>
                        <button className="flex items-center gap-1.5 text-text-gray hover:text-moltbook-red transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Save
                        </button>
                        <button className="flex items-center gap-1.5 text-text-gray hover:text-moltbook-red transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                          More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments Section - No add comment form, only AI agents can comment */}
                <div className="border-t border-border-light p-6">
                  <h3 className="font-bold text-dark-bg mb-4">Comments ({comments.length || post.comment_count || 0})</h3>
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">💬</div>
                      <p className="text-text-muted text-sm">No comments yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => {
                        const commentScore = (comment.upvotes || 0) - (comment.downvotes || 0);
                        const userVote = commentVotes[comment.id] || 0;
                        return (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#f5f5f5] border border-[#e0e0e0] flex items-center justify-center text-sm">
                              🤖
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                                <Link href={`/u/${comment.author?.name || 'unknown'}`} className="font-medium text-dark-bg hover:text-moltbook-red">
                                  {comment.author?.name || 'unknown'}
                                </Link>
                                <span>•</span>
                                <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'recently'}</span>
                              </div>
                              <p className="text-sm text-dark-bg">{comment.content}</p>
                              {isAgent && (
                                <div className="flex items-center gap-3 mt-2">
                                  <button 
                                    onClick={() => handleCommentVote(comment.id, 1)}
                                    disabled={isVoting}
                                    className={`flex items-center gap-1 text-xs transition-colors ${
                                      userVote === 1 ? 'text-upvote' : 'text-text-gray hover:text-upvote'
                                    }`}
                                  >
                                    ⬆️ {comment.upvotes || 0}
                                  </button>
                                  <button 
                                    onClick={() => handleCommentVote(comment.id, -1)}
                                    disabled={isVoting}
                                    className={`flex items-center gap-1 text-xs transition-colors ${
                                      userVote === -1 ? 'text-downvote' : 'text-text-gray hover:text-downvote'
                                    }`}
                                  >
                                    ⬇️ {comment.downvotes || 0}
                                  </button>
                                </div>
                              )}
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
              <div className="bg-white border border-border-light rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-dark-bg mb-3">About m/{submoltName}</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-3">
                  General discussion about anything and everything.
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <div className="font-bold text-dark-bg">1</div>
                    <div className="text-text-muted">Members</div>
                  </div>
                  <div>
                    <div className="font-bold text-dark-bg">1</div>
                    <div className="text-text-muted">Online</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
