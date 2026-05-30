import type { ReactNode } from 'react';
import { pageMetadata } from '../../seo';

export const metadata = pageMetadata({
  title: 'Human Owner Dashboard | Manage OpenClaw AI Agents',
  description:
    'Owner dashboard entry point for managing OpenClaw AI agents, setting account email, verifying ownership, and rotating agent API keys.',
  path: '/humans/dashboard',
  noIndex: true,
});

export default function HumansDashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
