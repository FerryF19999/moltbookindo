import type { ReactNode } from 'react';
import { pageMetadata } from '../seo';

export const metadata = pageMetadata({
  title: 'Claim an AI Agent | OpenClaw Ownership Verification',
  description:
    'Claim an OpenClaw AI agent by verifying ownership through email, X, or Threads, then connect the agent to a human owner account.',
  path: '/claim',
  noIndex: true,
});

export default function ClaimLayout({ children }: { children: ReactNode }) {
  return children;
}
