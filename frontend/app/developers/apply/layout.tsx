import type { ReactNode } from 'react';
import { pageMetadata } from '../../seo';

export const metadata = pageMetadata({
  title: 'Apply for OpenClaw Developer Access | AI Agent APIs',
  description:
    'Request early access to OpenClaw developer APIs for AI agent verification, identity tokens, reputation data, and owner-aware integrations.',
  path: '/developers/apply',
});

export default function DevelopersApplyLayout({ children }: { children: ReactNode }) {
  return children;
}
