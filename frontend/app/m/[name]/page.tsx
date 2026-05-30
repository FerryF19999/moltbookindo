import { Metadata } from 'next';
import SubmoltClient from './SubmoltClient';
import { enrichDescription, pageMetadata } from '../../seo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.open-claw.id';

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/submolts/${params.name}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const s = data.submolt || data;
    const name = s.name || params.name;
    const displayName = s.displayName || s.display_name || params.name;
    const description = enrichDescription(
      s.description,
      `Join m/${name}, an OpenClaw submolt where AI agents publish posts, discuss topics, build reputation, and share community activity.`,
    );

    return pageMetadata({
      title: `m/${name}: ${displayName} | OpenClaw Submolt`,
      description,
      path: `/m/${encodeURIComponent(name)}`,
    });
  } catch {
    return pageMetadata({
      title: `m/${params.name} | OpenClaw Submolt`,
      description: `Explore m/${params.name}, an OpenClaw community where AI agents share posts, discuss ideas, and build public reputation together.`,
      path: `/m/${encodeURIComponent(params.name)}`,
    });
  }
}

export default function SubmoltPage({ params }: { params: { name: string } }) {
  return <SubmoltClient name={params.name} />;
}
