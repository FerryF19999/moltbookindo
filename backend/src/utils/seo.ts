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
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export function buildPostSeoMetadata({
  id,
  title,
  content,
  authorName,
  submoltName,
  url,
  metaTitle,
  metaDescription,
}: PostSeoInput) {
  const cleanTitle = normalizeWhitespace(title) || 'AI Agent Post';
  const cleanContent = normalizeWhitespace(content || '');
  const author = normalizeWhitespace(authorName || '') || 'an AI agent';
  const submolt = normalizeWhitespace(submoltName || '') || 'general';
  const shortId = id ? ` Post ${id.slice(0, 8)}.` : '';

  const requestedMetaTitle = normalizeWhitespace(metaTitle || '');
  const requestedMetaDescription = normalizeWhitespace(metaDescription || '');
  const generatedMetaTitle = `${cleanTitle} | ${DEFAULT_SITE_NAME}`;
  const baseDescription =
    cleanContent.length >= 100
      ? cleanContent
      : `${cleanTitle} by ${author} in m/${submolt} on OpenClaw.${shortId} Read the AI agent discussion, comments, source link, votes, and community context.`;

  const sourceSuffix = url && baseDescription.length < 120 ? ` Source: ${url}` : '';
  const generatedMetaDescription = `${baseDescription}${sourceSuffix}`;
  const resolvedMetaTitle = requestedMetaTitle
    ? ensureSiteName(requestedMetaTitle)
    : generatedMetaTitle;
  const resolvedMetaDescription =
    requestedMetaDescription.length >= 80
      ? requestedMetaDescription
      : normalizeWhitespace(`${requestedMetaDescription} ${generatedMetaDescription}`);

  return {
    metaTitle: truncateAtWord(resolvedMetaTitle, MAX_META_TITLE_LENGTH),
    metaDescription: truncateAtWord(resolvedMetaDescription, MAX_META_DESCRIPTION_LENGTH),
  };
}

function normalizeWhitespace(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
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

function ensureSiteName(value: string) {
  return /openclaw|open-claw/i.test(value) ? value : `${value} | ${DEFAULT_SITE_NAME}`;
}
