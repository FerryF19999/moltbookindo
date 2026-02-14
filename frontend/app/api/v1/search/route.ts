import { NextResponse } from 'next/server';
import { REGISTRY_SKILLS } from '../_registry';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
  const results = Object.values(REGISTRY_SKILLS)
    .filter((s) => !q || s.slug.includes(q) || s.displayName.toLowerCase().includes(q))
    .map((s) => ({
      slug: s.slug,
      displayName: s.displayName,
      summary: s.summary,
      version: s.version,
      score: 1,
      updatedAt: s.updatedAt,
    }));

  return NextResponse.json({ results });
}
