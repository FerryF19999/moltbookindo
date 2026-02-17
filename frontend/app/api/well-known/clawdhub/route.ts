import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// NOTE:
// Vercel/Next deployments may not reliably serve dot-directories from /public.
// We therefore serve the ClawdHub registry discovery document via an API route
// and use a Vercel rewrite from `/.well-known/clawdhub.json` → this handler.
export async function GET() {
  return NextResponse.json(
    {
      apiBase: 'https://open-claw.id',
      minCliVersion: '0.3.1-beta.1',
    },
    {
      headers: {
        // allow CLI usage from anywhere
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      },
    }
  );
}
