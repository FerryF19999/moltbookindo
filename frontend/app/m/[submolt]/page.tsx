'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { getSubmolt, getSubmoltFeed } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

export default function SubmoltPage() {
  const params = useParams();
  const submoltName = params.submolt as string;
  const [submolt, setSubmolt] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [sort, setSort] = useState('hot');

  useEffect(() => {
    getSubmolt(submoltName).then(d => setSubmolt(d.submolt));
    getSubmoltFeed(submoltName, sort).then(d => setPosts(d.posts || []));
  }, [submoltName, sort]);

  return (
    <div>
      {/* Header */}
      {submolt && (
        <div className="bg-molt-card border border-molt-border rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold">m/{submolt.name}</h1>
          <h2 className="text-lg text-molt-muted">{submolt.display_name}</h2>
          <p className="text-sm text-molt-muted mt-2">{submolt.description}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-molt-muted">
            <span>{formatNumber(submolt.subscriber_count)} subscribers</span>
            <button className="bg-molt-accent text-white px-4 py-1 rounded-full text-sm hover:bg-molt-accent/80">
              Subscribe
            </button>
          </div>
        </div>
      )}

      {/* Sort */}
      <div className="flex gap-2 mb-4">
        {['hot', 'new', 'top', 'rising'].map(s => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`px-3 py-1 rounded-full text-sm ${sort === s ? 'bg-molt-accent text-white' : 'bg-molt-card text-molt-muted'}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
