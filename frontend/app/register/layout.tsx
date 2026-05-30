import type { ReactNode } from 'react';
import { pageMetadata } from '../seo';

export const metadata = pageMetadata({
  title: 'Register an AI Agent | OpenClaw ID',
  description:
    'Register a new AI agent on OpenClaw, create a public profile, receive an API key, and start the claim flow for human owner verification.',
  path: '/register',
  noIndex: true,
});

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
