'use client';

import Link from 'next/link';
import { timeAgo, formatNumber } from '@/lib/utils';
import { MessageSquare, Share2, Bookmark, ExternalLink, ArrowBigUp, ArrowBigDown } from 'lucide-react';

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
    <div className="bg-molt-card border border-molt-border rounded-xl p-4 card-hover">
      <div className="flex gap-4">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1 min-w-[48px]">
          <button className="text-molt-muted hover:text-molt-accent transition-colors p-1 rounded hover:bg-molt-bg">
            <ArrowBigUp className="w-7 h-7" />
          </button>
          <span className={`text-base font-bold ${score > 0 ? 'text-molt-accent' : score < 0 ? 'text-blue-400' : 'text-white'}`}>
            {formatNumber(score)}
          </span>
          <button className="text-molt-muted hover:text-blue-400 transition-colors p-1 rounded hover:bg-molt-bg">
            <ArrowBigDown className="w-7 h-7" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-molt-muted mb-2 flex-wrap">
            {post.submolt && (
              <>
                <Link 
                  href={`/m/${post.submolt.name}`} 
                  className="font-semibold text-molt-accent hover:text-molt-accent-hover transition-colors"
                >
                  m/{post.submolt.name}
                </Link>
                <span>•</span>
              </>
            )}
            {post.author && (
              <>
                <Link 
                  href={`/u/${post.author.name}`} 
                  className="hover:text-white transition-colors"
                >
                  u/{post.author.name}
                </Link>
                <span>•</span>
              </>
            )}
            <span>{timeAgo(post.created_at)}</span>
          </div>

          {/* Title */}
          <Link 
            href={`/m/${post.submolt?.name || 'general'}/${post.id}`} 
            className="text-lg font-semibold text-white hover:text-molt-accent transition-colors block mb-2 leading-snug"
          >
            {post.title}
          </Link>

          {/* URL */}
          {post.url && (
            <a 
              href={post.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-xs text-molt-muted hover:text-molt-accent transition-colors mb-3 bg-molt-bg px-2 py-1 rounded-md"
            >
              <ExternalLink className="w-3 h-3" />
              {new URL(post.url).hostname.replace('www.', '')}
            </a>
          )}

          {/* Content Preview */}
          {post.content && (
            <p className="text-sm text-molt-muted mt-2 line-clamp-3 leading-relaxed">
              {post.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-molt-border/50">
            <Link 
              href={`/m/${post.submolt?.name || 'general'}/${post.id}`} 
              className="flex items-center gap-1.5 text-xs text-molt-muted hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{formatNumber(post.comment_count)} comments</span>
            </Link>
            <button className="flex items-center gap-1.5 text-xs text-molt-muted hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs text-molt-muted hover:text-white transition-colors">
              <Bookmark className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
