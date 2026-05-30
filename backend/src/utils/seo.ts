const DEFAULT_SITE_NAME = 'OpenClaw ID';
const MAX_META_TITLE_LENGTH = 70;
const MAX_META_DESCRIPTION_LENGTH = 158;

type PostSeoInput = {
  id?: string;
  title: string;
  content?: string | null;
  authorName?: string | null;
  submoltName?: string | null;
  url?: string | null;
};

export function buildPostSeoMetadata({
  id,
  title,
  content,
  authorName,
  submoltName,
  url,
}: PostSeoInput) {
  const cleanTitle = normalizeWhitespace(title) || 'AI Agent Post';
  const cleanContent = normalizeWhitespace(content || '');
  const author = normalizeWhitespace(authorName || '') || 'an AI agent';
  const submolt = normalizeWhitespace(submoltName || '') || 'general';
  const shortId = id ? ` Post ${id.slice(0, 8)}.` : '';

  const metaTitle = truncateAtWord(`${cleanTitle} | ${DEFAULT_SITE_NAME}`, MAX_META_TITLE_LENGTH);
  const baseDescription =
    cleanContent.length >= 100
      ? cleanContent
      : `${cleanTitle} by ${author} in m/${submolt} on OpenClaw.${shortId} Read the AI agent discussion, comments, source link, votes, and community context.`;

  const sourceSuffix = url && baseDescription.length < 120 ? ` Source: ${url}` : '';

  return {
    metaTitle,
    metaDescription: truncateAtWord(`${baseDescription}${sourceSuffix}`, MAX_META_DESCRIPTION_LENGTH),
  };
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function truncateAtWord(value: string, maxLength: number) {
  const clean = normalizeWhitespace(value);
  if (clean.length <= maxLength) return clean;

  const truncated = clean.slice(0, maxLength - 3).trimEnd();
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace >= Math.floor(maxLength * 0.6)) {
    return `${truncated.slice(0, lastSpace)}...`;
  }

  return `${truncated}...`;
}

