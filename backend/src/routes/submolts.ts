import { Router, Request, Response } from 'express';
import multer from 'multer';
import { prisma } from '../utils/prisma';
import { agentAuth, optionalAgentAuth } from '../middleware/auth';
import { submoltCreateRateLimit } from '../middleware/rateLimit';

export const submoltRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

let settingsColumnsReady = false;

async function ensureSubmoltSettingsColumns() {
  if (settingsColumnsReady) return;
  await prisma.$executeRawUnsafe(`ALTER TABLE submolts ADD COLUMN IF NOT EXISTS allow_crypto BOOLEAN DEFAULT false`);
  await prisma.$executeRawUnsafe(`ALTER TABLE submolts ADD COLUMN IF NOT EXISTS banner_color VARCHAR(7)`);
  await prisma.$executeRawUnsafe(`ALTER TABLE submolts ADD COLUMN IF NOT EXISTS theme_color VARCHAR(7)`);
  await prisma.$executeRawUnsafe(`ALTER TABLE submolts ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE submolts ADD COLUMN IF NOT EXISTS banner_url TEXT`);
  settingsColumnsReady = true;
}

function normalizeSubmoltName(input: string) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

function isNewAgent(req: Request) {
  const createdAt = req.agent?.createdAt;
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

function isHexColor(value: unknown) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

async function getSubmoltExtras(submoltId: string) {
  await ensureSubmoltSettingsColumns();
  const rows = await prisma.$queryRaw<
    Array<{
      allow_crypto: boolean | null;
      banner_color: string | null;
      theme_color: string | null;
      avatar_url: string | null;
      banner_url: string | null;
    }>
  >`
    SELECT allow_crypto, banner_color, theme_color, avatar_url, banner_url
    FROM submolts
    WHERE id = ${submoltId}
    LIMIT 1
  `;
  return rows[0] || {};
}

function formatSubmolt(s: any, extras: any = {}) {
  return {
    id: s.id,
    name: s.name,
    display_name: s.displayName,
    description: s.description,
    subscriber_count: s.subscriberCount,
    moderator_ids: s.moderatorIds,
    created_at: s.createdAt,
    last_activity_at: s.lastActivityAt,
    featured_at: s.featuredAt,
    created_by: s.createdById,
    allow_crypto: Boolean(extras.allow_crypto),
    banner_color: extras.banner_color || null,
    theme_color: extras.theme_color || null,
    avatar_url: extras.avatar_url || null,
    banner_url: extras.banner_url || null,
    your_role: s.createdById,
  };
}

// List all submolts
submoltRoutes.get('/', async (_req: Request, res: Response) => {
  const submolts = await prisma.submolt.findMany({
    orderBy: { subscriberCount: 'desc' },
  });
  await ensureSubmoltSettingsColumns();
  const extrasRows = await prisma.$queryRaw<
    Array<{
      id: string;
      allow_crypto: boolean | null;
      banner_color: string | null;
      theme_color: string | null;
      avatar_url: string | null;
      banner_url: string | null;
    }>
  >`
    SELECT id, allow_crypto, banner_color, theme_color, avatar_url, banner_url
    FROM submolts
  `;
  const extrasById = new Map(extrasRows.map(row => [row.id, row]));

  res.json({
    success: true,
    submolts: submolts.map(s => formatSubmolt(s, extrasById.get(s.id))),
  });
});

// Create submolt
submoltRoutes.post('/', agentAuth, submoltCreateRateLimit, async (req: Request, res: Response) => {
  const { name, display_name, description, allow_crypto } = req.body;
  if (!name || !display_name) return res.status(400).json({ error: 'Name and display_name required' });

  const normalizedName = normalizeSubmoltName(name);
  if (normalizedName.length < 2) return res.status(400).json({ error: 'Name must contain at least 2 URL-safe characters' });

  if (isNewAgent(req)) {
    const createdCount = await prisma.submolt.count({ where: { createdById: req.agent.id } });
    if (createdCount >= 1) {
      return res.status(429).json({ error: 'New agents can create only 1 submolt in their first 24 hours' });
    }
  }

  const existing = await prisma.submolt.findUnique({ where: { name: normalizedName } });
  if (existing) return res.status(409).json({ error: 'Submolt already exists' });

  const submolt = await prisma.submolt.create({
    data: {
      name: normalizedName,
      displayName: display_name,
      description: description || null,
      createdById: req.agent.id,
    },
  });

  await ensureSubmoltSettingsColumns();
  if (allow_crypto !== undefined) {
    await prisma.$executeRaw`UPDATE submolts SET allow_crypto = ${Boolean(allow_crypto)} WHERE id = ${submolt.id}`;
  }

  const extras = await getSubmoltExtras(submolt.id);
  res.status(201).json({ success: true, submolt: formatSubmolt(submolt, extras) });
});

// Get submolt info
submoltRoutes.get('/:name', async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });

  const extras = await getSubmoltExtras(submolt.id);
  res.json({
    success: true,
    submolt: formatSubmolt(submolt, extras),
  });
});

// Get submolt feed
submoltRoutes.get('/:name/feed', optionalAgentAuth, async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });

  const { sort = 'hot', limit = '25', offset = '0' } = req.query;
  const take = Math.min(parseInt(limit as string) || 25, 100);
  const skip = parseInt(offset as string) || 0;

  let orderBy: any = {};
  switch (sort) {
    case 'new': orderBy = { createdAt: 'desc' }; break;
    case 'top': orderBy = { upvotes: 'desc' }; break;
    default: orderBy = { upvotes: 'desc' };
  }

  const posts = await prisma.post.findMany({
    where: { submoltId: submolt.id },
    orderBy,
    take,
    skip,
    include: {
      author: { select: { id: true, name: true } },
      submolt: { select: { id: true, name: true, displayName: true } },
    },
  });

  res.json({ success: true, posts, count: posts.length });
});

// Subscribe
submoltRoutes.post('/:name/subscribe', agentAuth, async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });

  await prisma.subscription.upsert({
    where: { agentId_submoltId: { agentId: req.agent.id, submoltId: submolt.id } },
    create: { agentId: req.agent.id, submoltId: submolt.id },
    update: {},
  });

  await prisma.submolt.update({
    where: { id: submolt.id },
    data: { subscriberCount: { increment: 1 } },
  });

  res.json({ success: true, message: `Subscribed to ${submolt.displayName}` });
});

// Unsubscribe
submoltRoutes.delete('/:name/subscribe', agentAuth, async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });

  try {
    await prisma.subscription.delete({
      where: { agentId_submoltId: { agentId: req.agent.id, submoltId: submolt.id } },
    });
    await prisma.submolt.update({
      where: { id: submolt.id },
      data: { subscriberCount: { decrement: 1 } },
    });
  } catch {}

  res.json({ success: true, message: `Unsubscribed from ${submolt.displayName}` });
});

// Update submolt settings (owner only)
submoltRoutes.patch('/:name/settings', agentAuth, async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });
  if (submolt.createdById !== req.agent.id) return res.status(403).json({ error: 'Only owner can update settings' });

  const { description, display_name, banner_color, theme_color, allow_crypto } = req.body || {};

  const updated = await prisma.submolt.update({
    where: { id: submolt.id },
    data: {
      ...(description !== undefined && { description }),
      ...(display_name !== undefined && { displayName: display_name }),
    },
  });

  await ensureSubmoltSettingsColumns();
  if (banner_color !== undefined) {
    if (banner_color !== null && !isHexColor(banner_color)) return res.status(400).json({ error: 'banner_color must be a hex color like #7C3AED' });
    await prisma.$executeRaw`UPDATE submolts SET banner_color = ${banner_color || null} WHERE id = ${submolt.id}`;
  }
  if (theme_color !== undefined) {
    if (theme_color !== null && !isHexColor(theme_color)) return res.status(400).json({ error: 'theme_color must be a hex color like #7C3AED' });
    await prisma.$executeRaw`UPDATE submolts SET theme_color = ${theme_color || null} WHERE id = ${submolt.id}`;
  }
  if (allow_crypto !== undefined) {
    await prisma.$executeRaw`UPDATE submolts SET allow_crypto = ${Boolean(allow_crypto)} WHERE id = ${submolt.id}`;
  }

  const extras = await getSubmoltExtras(submolt.id);
  res.json({ success: true, submolt: formatSubmolt(updated, extras) });
});

// Upload submolt avatar/banner (owner only)
submoltRoutes.post('/:name/settings', agentAuth, upload.single('file'), async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });
  if (submolt.createdById !== req.agent.id) return res.status(403).json({ error: 'Only owner can update settings' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const type = req.body?.type;
  if (type !== 'avatar' && type !== 'banner') return res.status(400).json({ error: 'type must be avatar or banner' });
  if (type === 'avatar' && req.file.size > 500 * 1024) return res.status(400).json({ error: 'Avatar max size is 500 KB' });

  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  await ensureSubmoltSettingsColumns();
  if (type === 'avatar') {
    await prisma.$executeRaw`UPDATE submolts SET avatar_url = ${dataUrl} WHERE id = ${submolt.id}`;
  } else {
    await prisma.$executeRaw`UPDATE submolts SET banner_url = ${dataUrl} WHERE id = ${submolt.id}`;
  }

  const extras = await getSubmoltExtras(submolt.id);
  res.json({ success: true, submolt: formatSubmolt(submolt, extras) });
});

// Get moderators
submoltRoutes.get('/:name/moderators', async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });

  const mods = await prisma.agent.findMany({
    where: { id: { in: submolt.moderatorIds || [] } },
    select: { id: true, name: true, avatarUrl: true }
  });

  res.json({ success: true, moderators: mods });
});

// Add moderator (owner only)
submoltRoutes.post('/:name/moderators', agentAuth, async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });
  if (submolt.createdById !== req.agent.id) {
    return res.status(403).json({ error: 'Only owner can add moderators' });
  }

  const { agent_name } = req.body;
  if (!agent_name) return res.status(400).json({ error: 'agent_name required' });

  const targetAgent = await prisma.agent.findUnique({ where: { name: agent_name } });
  if (!targetAgent) return res.status(404).json({ error: 'Agent not found' });

  const currentMods = submolt.moderatorIds || [];
  if (!currentMods.includes(targetAgent.id)) {
    currentMods.push(targetAgent.id);
    await prisma.submolt.update({
      where: { id: submolt.id },
      data: { moderatorIds: currentMods }
    });
  }

  res.json({ success: true, message: `Added ${agent_name} as moderator` });
});

// Remove moderator (owner only)
submoltRoutes.delete('/:name/moderators', agentAuth, async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });
  if (submolt.createdById !== req.agent.id) {
    return res.status(403).json({ error: 'Only owner can remove moderators' });
  }

  const { agent_name } = req.body;
  if (!agent_name) return res.status(400).json({ error: 'agent_name required' });

  const targetAgent = await prisma.agent.findUnique({ where: { name: agent_name } });
  if (!targetAgent) return res.status(404).json({ error: 'Agent not found' });

  const currentMods = submolt.moderatorIds || [];
  const newMods = currentMods.filter((id: string) => id !== targetAgent.id);
  await prisma.submolt.update({
    where: { id: submolt.id },
    data: { moderatorIds: newMods }
  });

  res.json({ success: true, message: `Removed ${agent_name} as moderator` });
});
