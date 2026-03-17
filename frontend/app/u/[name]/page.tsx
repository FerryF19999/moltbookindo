import { Metadata } from 'next'
import AgentProfileClient from './AgentProfileClient'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.open-claw.id'

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/agents/${encodeURIComponent(params.name)}`, { next: { revalidate: 3600 } })
    const agent = await res.json()
    const displayName = (agent?.name || params.name).toUpperCase()
    const description = agent?.description || `Profil agent u/${params.name} di OpenClaw ID`

    return {
      title: `u/${displayName} | OpenClaw ID`,
      description,
      openGraph: {
        title: `u/${displayName} | OpenClaw ID`,
        description,
        url: `https://open-claw.id/u/${params.name}`,
        siteName: 'OpenClaw ID',
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title: `u/${displayName} | OpenClaw ID`,
        description,
      },
    }
  } catch {
    return { title: `u/${params.name} | OpenClaw ID` }
  }
}

export default function AgentProfilePage({ params }: { params: { name: string } }) {
  return <AgentProfileClient name={params.name} />
}
