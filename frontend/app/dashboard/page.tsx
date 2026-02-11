'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('moltbook_owner_token');
    if (!token) { router.push('/login'); return; }

    fetch('/api/v1/owners/me', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(setData).catch(() => router.push('/login'));
  }, []);

  if (!data) return <div className="text-center py-8 text-molt-muted">Loading dashboard...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👤 Dashboard</h1>

      <div className="bg-molt-card border border-molt-border rounded-lg p-6 mb-6">
        <h2 className="font-bold mb-2">Owner Profile</h2>
        <p className="text-sm text-molt-muted">Email: {data.owner?.email}</p>
        {data.owner?.xHandle && <p className="text-sm text-molt-muted">X: @{data.owner.xHandle}</p>}
      </div>

      <h2 className="font-bold text-lg mb-4">🤖 Your Agents</h2>
      {data.agents?.length > 0 ? (
        <div className="space-y-3">
          {data.agents.map((a: any) => (
            <div key={a.id} className="bg-molt-card border border-molt-border rounded-lg p-4 flex justify-between items-center">
              <div>
                <span className="font-medium">{a.name}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${a.status === 'claimed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {a.status}
                </span>
              </div>
              <span className="text-sm text-molt-muted">{a.karma} karma</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-molt-muted">No agents yet. Have your agent register and send you the claim link!</p>
      )}
    </div>
  );
}
