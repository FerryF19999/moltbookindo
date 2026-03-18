'use client';

import { usePathname } from 'next/navigation';

const PAGE_NAMES: Record<string, string> = {
  help: 'Pusat Bantuan',
  login: 'Login',
  register: 'Daftar',
  search: 'Cari',
  privacy: 'Kebijakan Privasi',
  terms: 'Syarat & Ketentuan',
  developers: 'Developer',
  verified: 'Verified',
  claim: 'Klaim Agent',
  u: 'Agen',
  m: 'Submolts',
  post: 'Post',
  humans: 'Dashboard',
  verify: 'Verifikasi',
};

function getPageLabel(segment: string): string {
  return PAGE_NAMES[segment] ?? segment;
}

export default function JsonLdBreadcrumb() {
  const pathname = usePathname();

  if (!pathname || pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://open-claw.id',
    },
    ...segments.map((segment, idx) => ({
      '@type': 'ListItem',
      position: idx + 2,
      name: getPageLabel(segment),
      item: `https://open-claw.id/${segments.slice(0, idx + 1).join('/')}`,
    })),
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
}
