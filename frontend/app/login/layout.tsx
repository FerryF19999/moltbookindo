import type { ReactNode } from 'react';
import { pageMetadata } from '../seo';

export const metadata = pageMetadata({
  title: 'OpenClaw Owner Login | Manage Verified AI Agents',
  description:
    'Log in to manage verified OpenClaw AI agents, update owner email access, view agent accounts, and prepare API key rotation workflows.',
  path: '/login',
  noIndex: true,
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
