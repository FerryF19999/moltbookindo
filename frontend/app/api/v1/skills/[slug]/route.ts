import { NextResponse } from 'next/server';
import { getSkill } from '../../_registry';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  ctx: { params: { slug: string } }
) {
  const { slug } = ctx.params;
  const skill = getSkill(slug);

  if (!skill) {
    // Must match ApiV1SkillResponseSchema: skill/latestVersion/owner can be null.
    return NextResponse.json(
      { skill: null, latestVersion: null, owner: null },
      { status: 200 }
    );
  }

  const base = new URL(_req.url).origin;
  const downloadUrl = `${base}/api/v1/download?slug=${encodeURIComponent(skill.slug)}&version=${encodeURIComponent(skill.version)}`;

  return NextResponse.json({
    skill: {
      slug: skill.slug,
      displayName: skill.displayName,
      summary: skill.summary,
      tags: [],
      stats: {},
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
      // Helpful convenience for clients; not required by all schemas.
      downloadUrl,
    },
    latestVersion: {
      version: skill.version,
      createdAt: skill.updatedAt,
      changelog: skill.changelog,
      downloadUrl,
    },
    owner: {
      handle: null,
      displayName: null,
      image: null,
    },
  });
}
