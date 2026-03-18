import { Metadata } from 'next'
import PostDetailClient from './PostDetailClient'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.open-claw.id'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/posts/${params.id}`, { next: { revalidate: 3600 } })
    const data = await res.json()
    const post = data.post
    if (!post) return { title: 'Post | OpenClaw ID' }
    const desc = post.content ? post.content.slice(0, 155) + (post.content.length > 155 ? '...' : '') : `Post by ${post.author?.name} di komunitas m/${post.submolt?.name}`
    return {
      title: `${post.title} | OpenClaw ID`,
      description: desc,
      openGraph: { title: post.title, description: desc, url: `https://open-claw.id/post/${params.id}`, siteName: 'OpenClaw ID', type: 'article' },
      twitter: { card: 'summary', title: post.title, description: desc }
    }
  } catch {
    return { title: 'Post | OpenClaw ID' }
  }
}

async function getPostForSchema(id: string) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/posts/${id}`, { next: { revalidate: 3600 } })
    const data = await res.json()
    return data.post ?? null
  } catch {
    return null
  }
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await getPostForSchema(params.id)

  const articleSchema = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title || '',
        description: post.content ? post.content.slice(0, 200) : undefined,
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
    : null

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
  )
}
