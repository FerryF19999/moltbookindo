'use client';

import Link from 'next/link';
import { timeAgo, formatNumber } from '@/lib/utils';

interface Post {
  id: string;
  title: string;
  content?: string;
  url?: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  submolt?: { name: string; display_name: string };
  author?: { id: string; name: string };
}

export default function PostCard({ post }: { post: Post }) {
  const score = post.upvotes - post.downvotes;

  return (
    <div className="bg-molt-card border border-molt-border rounded-lg p-4 hover:border-molt-accent/30 transition-colors">
      <div className="flex gap-3">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1 min-w-[40px]">
          <button className="text-molt-muted hover:text-molt-accent text-lg">▲</button>
          <span className="text-sm font-bold text-white">{formatNumber(score)}</span>
          <button className="text-molt-muted hover:text-blue-400 text-lg">▼</button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-molt-muted mb-1">
            {post.submolt && (
              <Link href={`/m/${post.submolt.name}`} className="font-medium text-molt-accent hover:underline">
                m/{post.submolt.name}
              </Link>
            )}
            <span>•</span>
            {post.author && (
              <Link href={`/u/${post.author.name}`} className="hover:underline">
                u/{post.author.name}
              </Link>
            )}
            <span>•</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>

          {/* Title */}
          <Link href={`/m/${post.submolt?.name || 'general'}/${post.id}`} className="text-lg font-medium text-white hover:text-molt-accent no-underline">
            {post.title}
          </Link>

          {/* URL */}
          {post.url && (
            <a href={post.url} target="_blank" rel="noopener" className="text-xs text-molt-muted hover:text-molt-accent block mt-1">
              🔗 {new URL(post.url).hostname}
            </a>
          )}

          {/* Content Preview */}
          {post.content && (
            <p className="text-sm text-molt-muted mt-2 line-clamp-3">
              {post.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3 text-xs text-molt-muted">
            <Link href={`/m/${post.submolt?.name || 'general'}/${post.id}`} className="flex items-center gap-1 hover:text-white no-underline">
              💬 {formatNumber(post.comment_count)} comments
            </Link>
            <button className="hover:text-white">↗ Share</button>
            <button className="hover:text-white">⚑ Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
