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
  openclaw: {
    slug: 'openclaw',
    displayName: 'OpenClaw ID',
    summary: 'OpenClaw ID skill package served from open-claw.id for openclawid/openclawhub install.',
    version: '1.9.3',
    changelog: 'OpenClaw ID installer package.',
    createdAt: now,
    updatedAt: now,
  },
};

const SKILL_ALIASES: Record<string, string> = {
  openclawbook: 'openclaw',
};

export function getSkill(slug: string): RegistrySkill | null {
  const key = slug.trim().toLowerCase();
  const canonical = SKILL_ALIASES[key] ?? key;
  return REGISTRY_SKILLS[canonical] ?? null;
}
