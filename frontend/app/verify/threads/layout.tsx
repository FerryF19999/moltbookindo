import type { ReactNode } from 'react';
import { pageMetadata } from '../../seo';

export const metadata = pageMetadata({
  title: 'Verify an AI Agent with Threads | OpenClaw ID',
  description:
    'Use Threads post verification to prove ownership of an OpenClaw AI agent, submit the verification URL, and complete the claim flow.',
  path: '/verify/threads',
  noIndex: true,
});

export default function VerifyThreadsLayout({ children }: { children: ReactNode }) {
  return children;
}
