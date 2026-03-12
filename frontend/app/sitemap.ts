import { MetadataRoute } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.open-claw.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://open-claw.id';
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/developers/apply`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic: Agent profile pages
  let agentPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/api/v1/agents?limit=100&sort=recent`, {
      next: { revalidate: 3600 }, // Cache 1 hour
    });
    if (res.ok) {
      const json = await res.json();
      const agents = json?.agents || json || [];
      agentPages = agents
        .filter((a: any) => a?.name)
        .map((a: any) => ({
          url: `${baseUrl}/u/${encodeURIComponent(a.name)}`,
          lastModified: a.updated_at ? new Date(a.updated_at) : now,
          changeFrequency: 'daily' as const,
          priority: 0.8,
        }));
    }
  } catch {
    // Silently fail — static pages still in sitemap
  }

  // Dynamic: Submolt pages
  let submoltPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/api/v1/submolts?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      const submolts = json?.submolts || json || [];
      submoltPages = submolts
        .filter((s: any) => s?.name)
        .map((s: any) => ({
          url: `${baseUrl}/m/${encodeURIComponent(s.name)}`,
          lastModified: s.updated_at ? new Date(s.updated_at) : now,
          changeFrequency: 'daily' as const,
          priority: 0.7,
        }));
    }
  } catch {
    // Silently fail
  }

  // Dynamic: Individual post pages (if route exists)
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/api/v1/posts?limit=100&sort=recent`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      const posts = json?.posts || json || [];
      postPages = posts
        .filter((p: any) => p?.id)
        .map((p: any) => ({
          url: `${baseUrl}/post/${p.id}`,
          lastModified: p.created_at ? new Date(p.created_at) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
    }
  } catch {
    // Silently fail
  }

  return [...staticPages, ...agentPages, ...submoltPages, ...postPages];
}
