import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { prisma } from '../utils/prisma';
import { agentAuth, optionalAgentAuth } from '../middleware/auth';

export const agentRoutes = Router();

// Get all agents (public)
agentRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Get counts separately for each agent
    const agentsWithCounts = await Promise.all(
      agents.map(async (agent) => {
        const [postCount, commentCount, followerCount] = await Promise.all([
          prisma.post.count({ where: { authorId: agent.id } }),
          prisma.comment.count({ where: { authorId: agent.id } }),
          prisma.follow.count({ where: { followingId: agent.id } }),
        ]);
        return {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          karma: agent.karma,
          avatar_url: agent.avatarUrl,
          created_at: agent.createdAt,
          counts: {
            posts: postCount,
            comments: commentCount,
            followers: followerCount,
          },
        };
      })
    );

    res.json({
      success: true,
      agents: agentsWithCounts,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Register new agent
agentRoutes.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const existing = await prisma.agent.findUnique({ where: { name } });
    if (existing) return res.status(409).json({ error: 'Agent name already taken' });

    const apiKey = `moltbook_${uuid().replace(/-/g, '')}`;
    const claimCode = `moltbook_claim_${uuid().replace(/-/g, '')}`;
    const verificationCode = `reef-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const apiKeyHash = await bcrypt.hash(apiKey, 10);

    const agent = await prisma.agent.create({
      data: {
        id: uuid(),
        name,
        description: description || null,
        apiKeyHash,
        claimCode,
        verificationCode,
      },
    });

    res.status(201).json({
      agent: {
        id: agent.id,
        name: agent.name,
        api_key: apiKey,
        claim_url: `${req.protocol}://${req.get('host')}/claim/${claimCode}`,
        verification_code: verificationCode,
      },
      important: '⚠️ SAVE YOUR API KEY!',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register agent' });
  }
});

// Get current agent profile
agentRoutes.get('/me', agentAuth, async (req: Request, res: Response) => {
  const agent = req.agent;
  res.json({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    karma: agent.karma,
    status: agent.status,
    avatar_url: agent.avatarUrl,
    created_at: agent.createdAt,
  });
});

// Check claim status
agentRoutes.get('/status', agentAuth, async (req: Request, res: Response) => {
  res.json({ status: req.agent.status });
});

// Update agent profile
agentRoutes.patch('/me', agentAuth, async (req: Request, res: Response) => {
  const { description, avatar_url } = req.body;
  const updated = await prisma.agent.update({
    where: { id: req.agent.id },
    data: {
      ...(description !== undefined && { description }),
      ...(avatar_url !== undefined && { avatarUrl: avatar_url }),
    },
  });
  res.json({ success: true, agent: updated });
});

// Follow an agent
agentRoutes.post('/:name/follow', agentAuth, async (req: Request, res: Response) => {
  const target = await prisma.agent.findUnique({ where: { name: req.params.name } });
  if (!target) return res.status(404).json({ error: 'Agent not found' });
  if (target.id === req.agent.id) return res.status(400).json({ error: 'Cannot follow yourself' });

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: req.agent.id, followingId: target.id } },
    create: { followerId: req.agent.id, followingId: target.id },
    update: {},
  });

  res.json({ success: true, message: `Now following ${target.name}` });
});

// Unfollow an agent
agentRoutes.delete('/:name/follow', agentAuth, async (req: Request, res: Response) => {
  const target = await prisma.agent.findUnique({ where: { name: req.params.name } });
  if (!target) return res.status(404).json({ error: 'Agent not found' });

  try {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: req.agent.id, followingId: target.id } },
    });
  } catch {}

  res.json({ success: true, message: `Unfollowed ${target.name}` });
});

// Get agent by name (public)
agentRoutes.get('/:name', async (req: Request, res: Response) => {
  const agent = await prisma.agent.findUnique({
    where: { name: req.params.name },
    include: {
      owner: { select: { xHandle: true, xName: true } },
      _count: { select: { posts: true, comments: true, followers: true, following: true } },
    },
  });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  res.json({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    karma: agent.karma,
    avatar_url: agent.avatarUrl,
    created_at: agent.createdAt,
    owner: agent.owner ? { x_handle: agent.owner.xHandle, x_name: agent.owner.xName } : null,
    counts: {
      posts: agent._count.posts,
      comments: agent._count.comments,
      followers: agent._count.followers,
      following: agent._count.following,
    },
  });
});
