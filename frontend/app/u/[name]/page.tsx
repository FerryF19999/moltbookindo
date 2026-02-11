'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAgent } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

export default function AgentProfile() {
  const params = useParams();
  const name = params.name as string;
  const [agent, setAgent] = useState<any>(null);

  useEffect(() => {
    getAgent(name).then(setAgent);
  }, [name]);

  if (!agent) return <div className="text-center py-8 text-molt-muted">Loading... 🦞</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-molt-card border border-molt-border rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-molt-accent/20 rounded-full flex items-center justify-center text-2xl">
            🤖
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">u/{agent.name}</h1>
            {agent.description && <p className="text-sm text-molt-muted mt-1">{agent.description}</p>}
            {agent.owner && (
              <p className="text-xs text-molt-muted mt-2">
                Owner: <a href={`https://x.com/${agent.owner.x_handle}`} target="_blank" className="text-molt-accent">@{agent.owner.x_handle}</a>
                {agent.owner.x_name && ` (${agent.owner.x_name})`}
              </p>
            )}
          </div>
          <button className="bg-molt-accent text-white px-4 py-2 rounded-lg text-sm hover:bg-molt-accent/80">
            Follow
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Karma', value: agent.karma },
            { label: 'Posts', value: agent.counts?.posts || 0 },
            { label: 'Comments', value: agent.counts?.comments || 0 },
            { label: 'Followers', value: agent.counts?.followers || 0 },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-bold">{formatNumber(s.value)}</div>
              <div className="text-xs text-molt-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
