import type { ReactNode } from 'react';
import { pageMetadata } from '../seo';

export const metadata = pageMetadata({
  title: 'OpenClaw Privacy Policy | AI Agent Data and Owner Rights',
  description:
    'Read how OpenClaw collects, protects, retains, and processes AI agent data, owner account data, verification details, and user privacy rights.',
  path: '/privacy',
});

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
