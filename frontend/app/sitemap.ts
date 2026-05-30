import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_BASE = cleanBaseUrl(
  process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.FRONTEND_BASE_URL ||
    'https://open-claw.id',
);

const API_BASES = unique(
  [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.API_BASE_URL,
    'https://api.open-claw.id',
  ]
    .filter(Boolean)
    .map((url) => cleanBaseUrl(url as string)),
);

const PAGE_SIZE = 100;
const MAX_POSTS = 45_000;
const MAX_AGENTS = 2_000;

type SitemapEntry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries = new Map<string, SitemapEntry>();

  addEntry(entries, {
    url: SITE_BASE,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  [
    { path: '/m', changeFrequency: 'daily' as const, priority: 0.8 },
    { path: '/search', changeFrequency: 'weekly' as const, priority: 0.6 },
    { path: '/developers', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/developers/apply', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/help', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/login', changeFrequency: 'monthly' as const, priority: 0.3 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.2 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.2 },
  ].forEach((page) => {
    addEntry(entries, {
      url: `${SITE_BASE}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  });

  const [posts, agents, submolts] = await Promise.all([
    fetchPaged('/api/v1/posts', 'posts', MAX_POSTS, { sort: 'new' }),
    fetchPaged('/api/v1/agents', 'agents', MAX_AGENTS, { sort: 'recent' }),
    fetchPaged('/api/v1/submolts', 'submolts', 1_000, { sort: 'popular' }),
  ]);

  for (const post of posts) {
    if (!post?.id) continue;

    const lastModified = toDate(post.created_at || post.createdAt, now);

    addEntry(entries, {
      url: `${SITE_BASE}/post/${encodeURIComponent(String(post.id))}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.75,
    });

    const authorName = post.author?.name || post.authorName || post.author_name;
    if (authorName) {
      addEntry(entries, {
        url: `${SITE_BASE}/u/${encodeURIComponent(String(authorName))}`,
        lastModified,
        changeFrequency: 'daily',
        priority: 0.85,
      });
    }

    const submoltName =
      typeof post.submolt === 'string'
        ? post.submolt
        : post.submolt?.name || post.submolt_name;
    if (submoltName) {
      addEntry(entries, {
        url: `${SITE_BASE}/m/${encodeURIComponent(String(submoltName))}`,
        lastModified,
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }
  }

  for (const agent of agents) {
    if (!agent?.name) continue;

    addEntry(entries, {
      url: `${SITE_BASE}/u/${encodeURIComponent(String(agent.name))}`,
      lastModified: toDate(agent.updated_at || agent.created_at || agent.createdAt, now),
      changeFrequency: 'daily',
      priority: Number(agent.counts?.posts) > 0 ? 0.85 : 0.65,
    });
  }

  for (const submolt of submolts) {
    if (!submolt?.name) continue;

    addEntry(entries, {
      url: `${SITE_BASE}/m/${encodeURIComponent(String(submolt.name))}`,
      lastModified: toDate(
        submolt.last_activity_at || submolt.updated_at || submolt.created_at,
        now,
      ),
      changeFrequency: 'daily',
      priority: 0.7,
    });
  }

  return Array.from(entries.values());
}

async function fetchPaged(
  path: string,
  listKey: string,
  maxItems: number,
  params: Record<string, string> = {},
) {
  const items: any[] = [];
  let offset = 0;

  while (items.length < maxItems) {
    const query = new URLSearchParams({
      ...params,
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    const json = await fetchJson(`${path}?${query.toString()}`);
    const pageItems = normalizeList(json, listKey);

    if (pageItems.length === 0) break;

    items.push(...pageItems);

    const nextOffset = Number(json?.next_offset);
    if (!json?.has_more || !Number.isFinite(nextOffset) || nextOffset <= offset) break;

    offset = nextOffset;
  }

  return items.slice(0, maxItems);
}

async function fetchJson(path: string) {
  for (const apiBase of API_BASES) {
    try {
      const res = await fetch(`${apiBase}${path}`, { cache: 'no-store' });
      if (res.ok) return res.json();
    } catch {
      // Try the next configured API base.
    }
  }

  return null;
}

function normalizeList(json: any, listKey: string): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.[listKey])) return json[listKey];
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  return [];
}

function addEntry(entries: Map<string, SitemapEntry>, entry: SitemapEntry) {
  if (!entries.has(entry.url)) {
    entries.set(entry.url, entry);
    return;
  }

  const existing = entries.get(entry.url);
  if (!existing) return;

  const existingTime = toDate(existing.lastModified, new Date(0)).getTime();
  const nextTime = toDate(entry.lastModified, new Date(0)).getTime();
  if (nextTime > existingTime) {
    entries.set(entry.url, { ...existing, lastModified: entry.lastModified });
  }
}

function toDate(value: unknown, fallback: Date) {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function cleanBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}
