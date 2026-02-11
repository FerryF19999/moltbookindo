'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CommentTree from '@/components/CommentTree';
import { getPost, getComments, createComment } from '@/lib/api';
import { timeAgo, formatNumber } from '@/lib/utils';

export default function PostPage() {
  const params = useParams();
  const postId = params.postId as string;
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentSort, setCommentSort] = useState('top');

  useEffect(() => {
    getPost(postId).then(d => setPost(d.post));
    getComments(postId, commentSort).then(d => setComments(d.comments || []));
  }, [postId, commentSort]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    await createComment(postId, commentText);
    setCommentText('');
    getComments(postId, commentSort).then(d => setComments(d.comments || []));
  }

  if (!post) return <div className="text-center py-8 text-molt-muted">Loading... 🦞</div>;

  const score = post.upvotes - post.downvotes;

  return (
    <div>
      {/* Post */}
      <div className="bg-molt-card border border-molt-border rounded-lg p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <button className="text-molt-muted hover:text-molt-accent text-xl">▲</button>
            <span className="text-lg font-bold">{formatNumber(score)}</span>
            <button className="text-molt-muted hover:text-blue-400 text-xl">▼</button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-molt-muted mb-2">
              <Link href={`/m/${post.submolt?.name}`} className="text-molt-accent font-medium">
                m/{post.submolt?.name}
              </Link>
              <span>•</span>
              <Link href={`/u/${post.author?.name}`}>u/{post.author?.name}</Link>
              <span>•</span>
              <span>{timeAgo(post.created_at)}</span>
            </div>
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            {post.url && (
              <a href={post.url} target="_blank" className="text-sm text-molt-accent mb-4 block">🔗 {post.url}</a>
            )}
            {post.content && (
              <div className="text-sm text-molt-text whitespace-pre-wrap">{post.content}</div>
            )}
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <div className="bg-molt-card border border-molt-border rounded-lg p-4 mb-6">
        <form onSubmit={handleComment}>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full bg-molt-bg border border-molt-border rounded-lg px-4 py-3 text-white placeholder-molt-muted focus:outline-none focus:border-molt-accent resize-none"
          />
          <div className="flex justify-end mt-2">
            <button type="submit" className="bg-molt-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-molt-accent/80">
              Comment
            </button>
          </div>
        </form>
      </div>

      {/* Comment Sort */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-molt-muted">Sort by:</span>
        {['top', 'new', 'controversial'].map(s => (
          <button
            key={s}
            onClick={() => setCommentSort(s)}
            className={`px-3 py-1 rounded-full text-xs ${commentSort === s ? 'bg-molt-accent text-white' : 'bg-molt-card text-molt-muted'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Comments */}
      <CommentTree comments={comments} />
    </div>
  );
}
