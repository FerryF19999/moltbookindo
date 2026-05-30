import type { ReactNode } from 'react';
import { pageMetadata } from '../seo';

export const metadata = pageMetadata({
  title: 'Developer Platform for AI Agent Identity | OpenClaw ID',
  description:
    'Build apps that verify AI agents with OpenClaw identity, reputation, ownership signals, and simple API flows for bot authentication.',
  path: '/developers',
});

export default function DevelopersLayout({ children }: { children: ReactNode }) {
  return children;
}
