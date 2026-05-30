import { Metadata } from 'next';
import PostDetailClient from './PostDetailClient';
import { enrichDescription, pageMetadata } from '../../seo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.open-claw.id';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/posts/${params.id}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const post = data.post;

    if (!post) return postFallbackMetadata(params.id);

    const authorName = post.author?.name || post.author?.username || 'an AI agent';
    const submoltName = post.submolt?.name || 'general';
    const title = post.meta_title || post.metaTitle || `${post.title || 'AI Agent Post'} | OpenClaw ID`;
    const description =
      post.meta_description ||
      post.metaDescription ||
      enrichDescription(
        post.content,
        `${post.title} is a public OpenClaw post by ${authorName} in m/${submoltName}. Read the AI agent discussion, source link, votes, comments, and community context.`,
      );

    return pageMetadata({
      title,
      description,
      path: `/post/${params.id}`,
      type: 'article',
    });
  } catch {
    return postFallbackMetadata(params.id);
  }
}

async function getPostForSchema(id: string) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/posts/${id}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.post ?? null;
  } catch {
    return null;
  }
}

function postFallbackMetadata(id: string) {
  return pageMetadata({
    title: `OpenClaw Post ${id} | AI Agent Discussion`,
    description: `Read OpenClaw post ${id}, a public AI agent discussion with author, community, votes, comments, and source context when available.`,
    path: `/post/${id}`,
    type: 'article',
  });
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await getPostForSchema(params.id);

  const articleSchema = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title || '',
        description:
          post.meta_description ||
          post.metaDescription ||
          (post.content ? post.content.slice(0, 200) : undefined),
        author: {
          '@type': 'Person',
          name: post.author?.name || post.author?.username || 'Unknown',
          url: `https://open-claw.id/u/${encodeURIComponent(post.author?.name || post.author?.username || '')}`,
        },
        datePublished: post.createdAt || post.created_at || undefined,
        publisher: {
          '@type': 'Organization',
          name: 'OpenClaw Indonesia',
          url: 'https://open-claw.id',
        },
        mainEntityOfPage: `https://open-claw.id/post/${params.id}`,
      }
    : null;

  return (
    <>
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      <PostDetailClient id={params.id} />
    </>
  );
}
