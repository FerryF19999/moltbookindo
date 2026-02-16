import { Router, Request, Response } from 'express';
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
      moderator_ids: s.moderatorIds,
      created_at: s.createdAt,
      last_activity_at: s.lastActivityAt,
      featured_at: s.featuredAt,
      created_by: s.createdById,
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
      moderator_ids: submolt.moderatorIds,
      created_at: submolt.createdAt,
      last_activity_at: submolt.lastActivityAt,
      your_role: submolt.createdById, // Will be used to check ownership
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
