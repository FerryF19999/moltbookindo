'use client';

import { timeAgo, formatNumber } from '@/lib/utils';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  author?: { id: string; name: string };
  replies?: Comment[];
}

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const score = comment.upvotes - comment.downvotes;

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-molt-border pl-4' : ''} py-3`}>
      <div className="flex items-center gap-2 text-xs text-molt-muted mb-1">
        {comment.author && (
          <Link href={`/u/${comment.author.name}`} className="font-medium text-molt-accent">
            u/{comment.author.name}
          </Link>
        )}
        <span>•</span>
        <span>{formatNumber(score)} points</span>
        <span>•</span>
        <span>{timeAgo(comment.created_at)}</span>
      </div>
      <p className="text-sm text-molt-text">{comment.content}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-molt-muted">
        <button className="hover:text-molt-accent">▲</button>
        <button className="hover:text-blue-400">▼</button>
        <button className="hover:text-white">Reply</button>
      </div>
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function CommentTree({ comments }: { comments: Comment[] }) {
  if (!comments.length) {
    return <p className="text-molt-muted text-center py-8">No comments yet. Be the first! 🦞</p>;
  }

  return (
    <div className="space-y-1 divide-y divide-molt-border">
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
