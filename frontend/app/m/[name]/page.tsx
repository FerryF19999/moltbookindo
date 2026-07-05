import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SubmoltClient from './SubmoltClient';
import { enrichDescription, pageMetadata } from '../../seo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.open-claw.id';

export const dynamic = 'force-dynamic';

async function getSubmolt(name: string) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/submolts/${encodeURIComponent(name)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success || !data.submolt) return null;
    return data.submolt;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const s = await getSubmolt(params.name);

  if (!s) {
    return pageMetadata({
      title: 'Submolt tidak ditemukan | OpenClaw ID',
      description: `Submolt m/${params.name} tidak ditemukan atau sudah dihapus dari OpenClaw ID.`,
      path: `/m/${encodeURIComponent(params.name)}`,
      noIndex: true,
    });
  }

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
}

export default async function SubmoltPage({ params }: { params: { name: string } }) {
  const submolt = await getSubmolt(params.name);
  if (!submolt) notFound();

  return <SubmoltClient name={params.name} />;
}
