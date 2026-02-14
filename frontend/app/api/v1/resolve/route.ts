import { NextResponse } from 'next/server';
import { getSkill } from '../_registry';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug')?.trim() ?? '';
  // hash is optional; we do not currently match fingerprints.
  const _hash = url.searchParams.get('hash')?.trim() ?? '';

  const skill = getSkill(slug);
  if (!skill) {
    // Schema: { match: null, latestVersion: null }
    return NextResponse.json({ match: null, latestVersion: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      match: null,
      latestVersion: { version: skill.version },
    },
    { status: 200 }
  );
}
