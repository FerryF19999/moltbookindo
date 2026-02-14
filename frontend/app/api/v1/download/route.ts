import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { getSkill } from '../_registry';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const defaultSlug = 'openclawbook';
  const slug = (url.searchParams.get('slug')?.trim() || defaultSlug);
  const version = url.searchParams.get('version')?.trim() ?? '';

  const skill = getSkill(slug);
  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  }

  const resolvedVersion = version || skill.version;
  if (resolvedVersion !== skill.version) {
    return NextResponse.json(
      { error: `Version not found: ${resolvedVersion}` },
      { status: 404 }
    );
  }

  const zipRel = join(
    process.cwd(),
    'public',
    'skills',
    skill.slug,
    `${skill.slug}-${skill.version}.zip`
  );

  const bytes = await readFile(zipRel);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${skill.slug}-${skill.version}.zip"`,
      'Cache-Control': 'public, max-age=60',
    },
  });
}
