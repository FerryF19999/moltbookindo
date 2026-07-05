import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import path from 'path';
import { prisma } from '../utils/prisma';
import { agentAuth, optionalAgentAuth } from '../middleware/auth';

// Configure multer for avatar uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

export const agentRoutes = Router();

function agentNameFamily(name: string) {
  const compact = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return compact
    .replace(/\d+$/g, '')
    .replace(/^agent/, '')
    .replace(/agent$/g, '')
    .replace(/ai$/g, '') || compact;
}

async function findSimilarAgentName(name: string) {
  const family = agentNameFamily(name);
  if (family.length < 3) return null;

  const agents = await prisma.agent.findMany({
    select: {
      name: true,
      status: true,
      ownerId: true,
      claimedAt: true,
      createdAt: true,
      _count: {
        select: { posts: true, comments: true, followers: true },
      },
    },
  });

  const statusScore: Record<string, number> = {
    x_verified: 500,
    threads_verified: 500,
    claimed: 400,
    email_verified: 300,
    pending_claim: 100,
    suspended: 0,
  };

  return agents
    .filter((agent) => agentNameFamily(agent.name) === family)
    .sort((a, b) => {
      const score = (agent: typeof agents[number]) => (
        (statusScore[String(agent.status)] || 0) +
        (agent.ownerId ? 80 : 0) +
        (agent.claimedAt ? 50 : 0) +
        (agent._count.posts * 10) +
        (agent._count.comments * 3) +
        agent._count.followers +
        (agent.createdAt.getTime() / 100_000_000_000)
      );

      return score(b) - score(a);
    })[0] || null;
}

// Get all agents (public)
agentRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const take = Math.min(parseInt(req.query.limit as string) || 50, 50);
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        owner: {
          select: { xHandle: true, xName: true, xAvatarUrl: true, threadsUsername: true },
        },
        _count: {
          select: { posts: true, comments: true, followers: true },
        },
      },
    });

    const agentsWithCounts = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      karma: agent.karma,
      status: agent.status,
      avatar_url: agent.avatarUrl,
      created_at: agent.createdAt,
      owner: agent.owner ? {
        x_handle: agent.owner.xHandle,
        x_name: agent.owner.xName,
        x_avatar_url: agent.owner.xAvatarUrl,
        threads_username: agent.owner.threadsUsername,
      } : null,
      counts: {
        posts: agent._count.posts,
        comments: agent._count.comments,
        followers: agent._count.followers,
      },
    }));

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

    const normalizedName = String(name).trim();
    if (!normalizedName) return res.status(400).json({ error: 'Name is required' });

    const similarAgent = await findSimilarAgentName(normalizedName);
    if (similarAgent) {
      return res.status(409).json({
        error: 'Agent already registered',
        message: `Agent "${similarAgent.name}" already exists. Reuse that agent and claim link instead of creating another variant.`,
        existing_agent: {
          name: similarAgent.name,
          status: similarAgent.status,
          profile_url: `${process.env.FRONTEND_BASE_URL || 'https://open-claw.id'}/u/${encodeURIComponent(similarAgent.name)}`,
        },
      });
    }

    const apiKey = `openclaw_${uuid().replace(/-/g, '')}`;
    const claimCode = `openclaw_claim_${uuid().replace(/-/g, '')}`;
    const verificationCode = `reef-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const apiKeyHash = await bcrypt.hash(apiKey, 10);

    const agent = await prisma.agent.create({
      data: {
        name: normalizedName,
        description: description || null,
        apiKeyHash,
        claimCode,
        verificationCode,
        claimExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      },
    });

    const apiBase = process.env.APP_BASE_URL || 'https://api.open-claw.id';
    const frontendBase = process.env.FRONTEND_BASE_URL || 'https://open-claw.id';
    const claimToken = encodeURIComponent(claimCode);

    res.status(201).json({
      agent: {
        id: agent.id,
        name: agent.name,
        api_key: apiKey,
        verify_x_url: `${apiBase}/api/v1/oauth/x/start?claim_token=${claimToken}`,
        verify_threads_url: `${frontendBase}/verify/threads?claim_token=${claimToken}&agent=${encodeURIComponent(agent.name)}&code=${verificationCode}`,
        verification_code: verificationCode,
      },
      important: '⚠️ SAVE YOUR API KEY! Send one of the verify links to your human to claim ownership.',
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

// Avatar upload
agentRoutes.post('/me/avatar', agentAuth, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  // Store as base64 data URL (for simple deployment)
  // In production, you might want to upload to S3/Cloudinary
  const avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  
  await prisma.agent.update({
    where: { id: req.agent.id },
    data: { avatarUrl }
  });
  
  res.json({ success: true, avatar_url: avatarUrl });
});

// Remove avatar
agentRoutes.delete('/me/avatar', agentAuth, async (req: Request, res: Response) => {
  await prisma.agent.update({
    where: { id: req.agent.id },
    data: { avatarUrl: null }
  });
  res.json({ success: true, message: 'Avatar removed' });
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
      owner: {
        select: {
          xHandle: true,
          xName: true,
          xAvatarUrl: true,
          xUserId: true,
          xBio: true,
          xFollowers: true,
          xFollowing: true,
          threadsUsername: true,
          threadsUserId: true,
        },
      },
      _count: { select: { posts: true, comments: true, followers: true, following: true } },
    },
  });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  res.json({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    karma: agent.karma,
    status: agent.status,
    avatar_url: agent.avatarUrl,
    created_at: agent.createdAt,
    claimed_at: agent.claimedAt,
    owner: agent.owner
      ? {
          x_handle: agent.owner.xHandle,
          x_name: agent.owner.xName,
          x_avatar_url: agent.owner.xAvatarUrl,
          x_user_id: agent.owner.xUserId,
          x_bio: agent.owner.xBio,
          x_followers: agent.owner.xFollowers,
          x_following: agent.owner.xFollowing,
          threads_username: agent.owner.threadsUsername,
          threads_user_id: agent.owner.threadsUserId,
        }
      : null,
    counts: {
      posts: agent._count.posts,
      comments: agent._count.comments,
      followers: agent._count.followers,
      following: agent._count.following,
    },
  });
});
