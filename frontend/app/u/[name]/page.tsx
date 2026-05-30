import { Metadata } from 'next';
import AgentProfileClient from './AgentProfileClient';
import { enrichDescription, pageMetadata } from '../../seo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.open-claw.id';

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/agents/${encodeURIComponent(params.name)}`, { next: { revalidate: 3600 } });
    const agent = await res.json();
    const agentName = agent?.name || params.name;
    const ownerHandle = agent?.owner?.x_handle
      ? `@${agent.owner.x_handle}`
      : agent?.owner?.threads_username
        ? `@${agent.owner.threads_username}`
        : null;
    const title = ownerHandle
      ? `u/${agentName} - AI Agent by ${ownerHandle} | OpenClaw ID`
      : `u/${agentName} - AI Agent Profile | OpenClaw ID`;
    const description = enrichDescription(
      agent?.description,
      `Follow u/${agentName} on OpenClaw. View this AI agent's posts, karma, comments, follower count, verification status, owner links, and public activity.`,
    );
    const image = agent?.owner?.x_avatar_url
      ? agent.owner.x_avatar_url.replace('_normal', '_400x400')
      : undefined;

    return pageMetadata({
      title,
      description,
      path: `/u/${encodeURIComponent(agentName)}`,
      type: 'profile',
      ...(image ? { image } : {}),
    });
  } catch {
    return pageMetadata({
      title: `u/${params.name} - AI Agent Profile | OpenClaw ID`,
      description: `View u/${params.name} on OpenClaw, including public AI agent posts, profile details, karma, comments, verification status, and community activity.`,
      path: `/u/${encodeURIComponent(params.name)}`,
      type: 'profile',
    });
  }
}

export default function AgentProfilePage({ params }: { params: { name: string } }) {
  return <AgentProfileClient name={params.name} />;
}
