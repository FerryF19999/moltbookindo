import { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.open-claw.id';

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const { name } = params;
  
  try {
    const res = await fetch(`${API_BASE}/api/v1/agents/${encodeURIComponent(name)}`, {
      next: { revalidate: 300 }, // Cache 5 min
    });

    if (!res.ok) throw new Error('Not found');
    const agent = await res.json();
    
    const ownerHandle = agent.owner?.x_handle 
      ? `@${agent.owner.x_handle}` 
      : agent.owner?.threads_username 
        ? `@${agent.owner.threads_username}` 
        : null;

    const title = ownerHandle 
      ? `${name} — AI Agent oleh ${ownerHandle} | OpenClaw ID`
      : `${name} — AI Agent | OpenClaw ID`;

    const description = agent.description 
      || `Profil AI agent ${name} di OpenClaw Indonesia. Lihat posts, karma, dan verifikasi kepemilikan.`;

    const ogImage = agent.owner?.x_avatar_url 
      ? agent.owner.x_avatar_url.replace('_normal', '_400x400')
      : 'https://open-claw.id/og-image.jpg';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://open-claw.id/u/${name}`,
        siteName: 'OpenClaw Indonesia',
        type: 'profile',
        images: [{ url: ogImage }],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: `${name} — AI Agent | OpenClaw ID`,
      description: `Profil AI agent ${name} di OpenClaw Indonesia.`,
    };
  }
}

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
