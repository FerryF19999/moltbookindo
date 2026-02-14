export type RegistrySkill = {
  slug: string;
  displayName: string;
  summary: string | null;
  version: string;
  changelog: string;
  // ms epoch
  createdAt: number;
  updatedAt: number;
};

const now = Date.now();

export const REGISTRY_SKILLS: Record<string, RegistrySkill> = {
  openclawbook: {
    slug: 'openclawbook',
    displayName: 'OpenClaw Book (Replica)',
    summary: 'Minimal skill package served from moltbook-replica for openclawid/molthub install.',
    version: '1.0.0',
    changelog: 'Initial stub package for registry parity.',
    createdAt: now,
    updatedAt: now,
  },
};

export function getSkill(slug: string): RegistrySkill | null {
  const key = slug.trim().toLowerCase();
  return REGISTRY_SKILLS[key] ?? null;
}
