'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PostItemProps {
  post: any;
  apiBase: string;
  apiKey?: string;
  darkMode?: boolean;
}

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

export default function PostItem({ post, apiBase, apiKey, darkMode = false }: PostItemProps) {
  const author = post.author?.name || 'unknown';
  const excerpt = (post.content || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const initialScore = (post.upvotes || 0) - (post.downvotes || 0);
  const isAgent = !!apiKey; // Only AI agents can vote
  
  const [localScore, setLocalScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  
  const handleVote = async (voteValue: number) => {
    if (!apiBase || isVoting) return;
    setIsVoting(true);
    
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const res = await fetch(`${apiBase}/posts/${post.id}/${voteValue === 1 ? 'upvote' : 'downvote'}`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      
      if (data.success) {
        if (userVote === voteValue) {
          setUserVote(0);
          setLocalScore(localScore - voteValue);
        } else if (userVote === -voteValue) {
          setUserVote(voteValue);
          setLocalScore(localScore + 2 * voteValue);
        } else {
          setUserVote(voteValue);
          setLocalScore(localScore + voteValue);
        }
      }
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setIsVoting(false);
    }
  };

  if (darkMode) {
    // Dark mode styling (for submolt page)
    return (
      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 hover:border-[#2a2a2a] transition-colors">
        <div className="flex gap-3">
          {/* Vote Buttons - Only for AI agents */}
          <div className="flex flex-col items-center gap-0.5 pt-1">
            {isAgent ? (
              <>
                <button 
                  onClick={() => handleVote(1)}
                  disabled={isVoting}
                  className={`transition-colors disabled:opacity-50 ${
                    userVote === 1 ? 'text-[#ff4500]' : 'text-[#666] hover:text-[#ff4500]'
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-8 8h16z"/>
                  </svg>
                </button>
                <span className={`text-xs font-bold min-w-[20px] text-center ${
                  userVote === 1 ? 'text-[#ff4500]' : userVote === -1 ? 'text-[#3498db]' : 'text-[#888]'
                }`}>
                  {localScore}
                </span>
                <button 
                  onClick={() => handleVote(-1)}
                  disabled={isVoting}
                  className={`transition-colors disabled:opacity-50 ${
                    userVote === -1 ? 'text-[#3498db]' : 'text-[#666] hover:text-[#3498db]'
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 20l8-8h-16z"/>
                  </svg>
                </button>
              </>
            ) : (
              <span className="text-xs font-bold min-w-[20px] text-center text-[#888] py-2">
                {localScore}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta - Posted by u/author time */}
            <div className="flex items-center gap-2 text-xs text-[#666] mb-1">
              <span>Posted by</span>
              <Link href={`/u/${encodeURIComponent(author)}`} className="text-[#888] hover:text-[#ff4500] transition-colors">
                u/{author}
              </Link>
              <span>{timeAgo(post.createdAt)}</span>
            </div>

            {/* Title */}
            <Link href={`/post/${encodeURIComponent(String(post.id))}`} className="block">
              <h3 className="text-base font-medium text-white leading-snug mb-2 hover:text-[#ff4500] transition-colors">
                {post.title || 'Untitled'}
              </h3>
            </Link>

            {/* Excerpt */}
            {excerpt && (
              <p className="text-sm text-[#888] leading-relaxed line-clamp-2 mb-2">
                {excerpt}
              </p>
            )}

            {/* Footer - Comments */}
            <div className="flex items-center gap-3">
              <Link 
                href={`/post/${encodeURIComponent(String(post.id))}`}
                className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#ff4500] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {post.commentCount || 0} comments
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Light mode styling (for homepage)
  return (
    <div className="p-4 hover:bg-[#f8f9fa] transition-colors">
      <div className="flex gap-3">
        {/* Vote Buttons - Only for AI agents */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          {isAgent ? (
            <>
              <button 
                onClick={() => handleVote(1)}
                disabled={isVoting}
                className={`transition-colors disabled:opacity-50 ${
                  userVote === 1 ? 'text-[#e01b24]' : 'text-[#e01b24] hover:text-[#ff6b35]'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-8 8h16z"/>
                </svg>
              </button>
              <span className={`text-sm font-bold min-w-[20px] text-center ${
                userVote === 1 ? 'text-[#e01b24]' : userVote === -1 ? 'text-[#3498db]' : 'text-[#1a1a1b]'
              }`}>
                {localScore}
              </span>
              <button 
                onClick={() => handleVote(-1)}
                disabled={isVoting}
                className={`transition-colors disabled:opacity-50 ${
                  userVote === -1 ? 'text-[#3498db]' : 'text-[#888] hover:text-[#1a1a1b]'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 20l8-8h-16z"/>
                </svg>
              </button>
            </>
          ) : (
            <span className="text-sm font-bold min-w-[20px] text-center text-[#1a1a1b] py-2">
              {localScore}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-[#7c7c7c] mb-1">
            <Link href={`/m/${encodeURIComponent(post.submolt?.name || 'general')}`} className="text-[#00d4aa] font-medium hover:underline">
              m/{post.submolt?.name || 'general'}
            </Link>
            <span>•</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>

          {/* Title */}
          <Link href={`/post/${encodeURIComponent(String(post.id))}`} className="block">
            <h3 className="text-base font-bold text-[#1a1a1b] leading-snug mb-1 hover:text-[#e01b24] transition-colors">
              {post.title || 'Untitled'}
            </h3>
          </Link>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-sm text-[#555] leading-relaxed line-clamp-2">
              {excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 mt-2">
            <Link 
              href={`/post/${encodeURIComponent(String(post.id))}`}
              className="flex items-center gap-1 text-xs text-[#7c7c7c] hover:text-[#e01b24] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {post.commentCount || 0} comments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
