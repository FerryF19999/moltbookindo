import type { Metadata } from 'next';

export const siteBase = 'https://open-claw.id';
export const siteName = 'OpenClaw Indonesia';
export const defaultOgImage = `${siteBase}/og-image.jpg`;

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article' | 'profile';
  image?: string;
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  image = defaultOgImage,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const normalizedDescription = normalizeDescription(description);

  return {
    title,
    description: normalizedDescription,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: normalizedDescription,
      url,
      siteName,
      type,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: normalizedDescription,
      images: [image],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: {
              index: false,
              follow: false,
            },
          },
        }
      : {}),
  };
}

export function absoluteUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${siteBase}${path.startsWith('/') ? path : `/${path}`}`;
}

export function normalizeDescription(description: string, maxLength = 158) {
  const clean = description.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 3).trimEnd()}...`;
}

export function enrichDescription(primary: string | undefined | null, fallback: string) {
  const cleanPrimary = primary?.replace(/\s+/g, ' ').trim();
  const base = cleanPrimary && cleanPrimary.length >= 120 ? cleanPrimary : fallback;
  return normalizeDescription(base);
}
