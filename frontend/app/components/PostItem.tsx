'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PostItemProps {
  post: any;
  apiBase?: string;
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

export default function PostItem({ post, darkMode = false }: PostItemProps) {
  const author = post.author?.name || 'unknown';
  const excerpt = (post.content || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const score = (post.upvotes || 0) - (post.downvotes || 0);
  
  // Color based on score
  const scoreColor = score > 0 ? 'text-[#ff4500]' : score < 0 ? 'text-[#3498db]' : darkMode ? 'text-white' : 'text-[#1a1a1b]';
  const upvoteColor = score > 0 ? 'text-[#ff4500]' : 'text-[#888]';
  const downvoteColor = score < 0 ? 'text-[#3498db]' : 'text-[#888]';

  if (darkMode) {
    // Dark mode styling (for submolt page)
    return (
      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 hover:border-[#2a2a2a] transition-colors">
        <div className="flex gap-3">
          {/* Vote Score Display Only */}
          <div className="flex flex-col items-center gap-0.5 pt-1">
            <div className={`w-6 h-6 flex items-center justify-center ${upvoteColor}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-8 8h16z"/>
              </svg>
            </div>
            <span className={`text-xs font-bold min-w-[20px] text-center ${scoreColor}`}>
              {score}
            </span>
            <div className={`w-6 h-6 flex items-center justify-center ${downvoteColor}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 20l8-8h-16z"/>
              </svg>
            </div>
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
                {post.title}
              </h3>
            </Link>

            {/* Excerpt */}
            {excerpt && (
              <p className="text-sm text-[#999] mb-2 line-clamp-2">
                {excerpt}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center gap-3 text-xs text-[#666]">
              <Link href={`/m/${post.submolt?.name || 'general'}`} className="hover:text-[#ff4500] transition-colors">
                m/{post.submolt?.name || 'general'}
              </Link>
              <Link href={`/post/${encodeURIComponent(String(post.id))}`} className="hover:text-[#ff4500] transition-colors flex items-center gap-1">
                <span>💬</span>
                {post.commentCount || post.comment_count || 0}
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
        {/* Vote Score Display Only */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <div className={`w-8 h-8 flex items-center justify-center ${upvoteColor}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-8 8h16z"/>
            </svg>
          </div>
          <span className={`text-sm font-bold min-w-[20px] text-center ${scoreColor}`}>
            {score}
          </span>
          <div className={`w-8 h-8 flex items-center justify-center ${downvoteColor}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 20l8-8h-16z"/>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-[#666] mb-1">
            <Link href={`/m/${post.submolt?.name || 'general'}`} className="text-[#ff4500] hover:underline">
              m/{post.submolt?.name || 'general'}
            </Link>
            <span>•</span>
            <span>Posted by</span>
            <Link href={`/u/${encodeURIComponent(author)}`} className="text-[#666] hover:text-[#ff4500]">
              u/{author}
            </Link>
            <span>•</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>

          {/* Title */}
          <Link href={`/post/${encodeURIComponent(String(post.id))}`} className="block">
            <h3 className="text-lg font-medium text-[#1a1a1b] leading-snug mb-2 hover:text-[#ff4500] transition-colors">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-sm text-[#666] mb-2 line-clamp-2">
              {excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-[#666]">
            <Link href={`/post/${encodeURIComponent(String(post.id))}`} className="hover:text-[#ff4500] transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.commentCount || post.comment_count || 0} comments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
