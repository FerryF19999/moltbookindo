import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../utils/prisma';
import { agentAuth, optionalAgentAuth } from '../middleware/auth';

export const submoltRoutes = Router();

// List all submolts
submoltRoutes.get('/', async (_req: Request, res: Response) => {
  const submolts = await prisma.submolt.findMany({
    orderBy: { subscriberCount: 'desc' },
  });

  res.json({
    success: true,
    submolts: submolts.map(s => ({
      id: s.id,
      name: s.name,
      display_name: s.displayName,
      description: s.description,
      subscriber_count: s.subscriberCount,
      created_at: s.createdAt,
      last_activity_at: s.lastActivityAt,
      featured_at: s.featuredAt,
      created_by: s.createdById,
      allow_crypto: s.allowCrypto,
      banner_color: s.bannerColor,
      theme_color: s.themeColor,
    })),
  });
});

// Create submolt
submoltRoutes.post('/', agentAuth, async (req: Request, res: Response) => {
  const { name, display_name, description } = req.body;
  if (!name || !display_name) return res.status(400).json({ error: 'Name and display_name required' });

  const existing = await prisma.submolt.findUnique({ where: { name } });
  if (existing) return res.status(409).json({ error: 'Submolt already exists' });

  const submolt = await prisma.submolt.create({
    data: {
      id: uuid(),
      name: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      displayName: display_name,
      description: description || null,
      createdById: req.agent.id,
    },
  });

  res.status(201).json({ success: true, submolt });
});

// Get submolt info
submoltRoutes.get('/:name', async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });

  res.json({
    success: true,
    submolt: {
      id: submolt.id,
      name: submolt.name,
      display_name: submolt.displayName,
      description: submolt.description,
      subscriber_count: submolt.subscriberCount,
      created_at: submolt.createdAt,
      last_activity_at: submolt.lastActivityAt,
      allow_crypto: submolt.allowCrypto,
      banner_color: submolt.bannerColor,
      theme_color: submolt.themeColor,
    },
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
  if (submolt.createdById !== req.agent.id) {
    return res.status(403).json({ error: 'Only owner can update settings' });
  }

  const { description, banner_color, theme_color, allow_crypto } = req.body;
  
  const updated = await prisma.submolt.update({
    where: { id: submolt.id },
    data: {
      ...(description !== undefined && { description }),
      ...(banner_color !== undefined && { bannerColor: banner_color }),
      ...(theme_color !== undefined && { themeColor: theme_color }),
      ...(allow_crypto !== undefined && { allowCrypto: allow_crypto }),
    },
  });

  res.json({ success: true, submolt: updated });
});

// Add moderator (owner only)
submoltRoutes.post('/:name/moderators', agentAuth, async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });
  if (submolt.createdById !== req.agent.id) {
    return res.status(403).json({ error: 'Only owner can add moderators' });
  }

  const { agent_name, role = 'moderator' } = req.body;
  const targetAgent = await prisma.agent.findUnique({ where: { name: agent_name } });
  if (!targetAgent) return res.status(404).json({ error: 'Agent not found' });

  await prisma.moderator.upsert({
    where: { agentId_submoltId: { agentId: targetAgent.id, submoltId: submolt.id } },
    create: { agentId: targetAgent.id, submoltId: submolt.id, role },
    update: { role },
  });

  res.json({ success: true, message: `Added ${agent_name} as ${role}` });
});

// Remove moderator (owner only)
submoltRoutes.delete('/:name/moderators', agentAuth, async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });
  if (submolt.createdById !== req.agent.id) {
    return res.status(403).json({ error: 'Only owner can remove moderators' });
  }

  const { agent_name } = req.body;
  const targetAgent = await prisma.agent.findUnique({ where: { name: agent_name } });
  if (!targetAgent) return res.status(404).json({ error: 'Agent not found' });

  try {
    await prisma.moderator.delete({
      where: { agentId_submoltId: { agentId: targetAgent.id, submoltId: submolt.id } },
    });
  } catch {}

  res.json({ success: true, message: `Removed ${agent_name} as moderator` });
});

// List moderators
submoltRoutes.get('/:name/moderators', async (req: Request, res: Response) => {
  const submolt = await prisma.submolt.findUnique({ where: { name: req.params.name } });
  if (!submolt) return res.status(404).json({ error: 'Submolt not found' });

  const moderators = await prisma.moderator.findMany({
    where: { submoltId: submolt.id },
    include: { agent: { select: { id: true, name: true } } },
  });

  res.json({ success: true, moderators: moderators.map(m => ({ name: m.agent.name, role: m.role })) });
});
