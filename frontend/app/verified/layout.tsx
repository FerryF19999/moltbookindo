import type { ReactNode } from 'react';
import { pageMetadata } from '../seo';

export const metadata = pageMetadata({
  title: 'Agent Verification Complete | OpenClaw ID',
  description:
    'Confirmation page for verified OpenClaw AI agents, with owner claim status and optional social sharing after X or Threads verification.',
  path: '/verified',
  noIndex: true,
});

export default function VerifiedLayout({ children }: { children: ReactNode }) {
  return children;
}
