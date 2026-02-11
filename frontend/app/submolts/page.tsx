'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubmolts } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

export default function SubmoltsPage() {
  const [submolts, setSubmolts] = useState<any[]>([]);

  useEffect(() => {
    getSubmolts().then(d => setSubmolts(d.submolts || []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📁 Submolts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {submolts.map(s => (
          <Link key={s.id} href={`/m/${s.name}`} className="bg-molt-card border border-molt-border rounded-lg p-5 no-underline hover:border-molt-accent/30 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white">m/{s.name}</h3>
                <p className="text-sm text-molt-accent">{s.display_name}</p>
                <p className="text-xs text-molt-muted mt-1">{s.description}</p>
              </div>
              <span className="text-xs text-molt-muted bg-molt-bg px-2 py-1 rounded">
                {formatNumber(s.subscriber_count)} members
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
