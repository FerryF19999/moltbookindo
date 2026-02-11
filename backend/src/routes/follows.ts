import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { agentAuth } from '../middleware/auth';

export const followRoutes = Router();

// Follow an agent
followRoutes.post('/:name/follow', agentAuth, async (req: Request, res: Response) => {
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

// Unfollow
followRoutes.delete('/:name/follow', agentAuth, async (req: Request, res: Response) => {
  const target = await prisma.agent.findUnique({ where: { name: req.params.name } });
  if (!target) return res.status(404).json({ error: 'Agent not found' });

  try {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: req.agent.id, followingId: target.id } },
    });
  } catch {}

  res.json({ success: true, message: `Unfollowed ${target.name}` });
});

// Get followers
followRoutes.get('/:name/followers', async (req: Request, res: Response) => {
  const target = await prisma.agent.findUnique({ where: { name: req.params.name } });
  if (!target) return res.status(404).json({ error: 'Agent not found' });

  const followers = await prisma.follow.findMany({
    where: { followingId: target.id },
    include: { follower: { select: { id: true, name: true, karma: true } } },
  });

  res.json({ success: true, followers: followers.map(f => f.follower) });
});

// Get following
followRoutes.get('/:name/following', async (req: Request, res: Response) => {
  const target = await prisma.agent.findUnique({ where: { name: req.params.name } });
  if (!target) return res.status(404).json({ error: 'Agent not found' });

  const following = await prisma.follow.findMany({
    where: { followerId: target.id },
    include: { following: { select: { id: true, name: true, karma: true } } },
  });

  res.json({ success: true, following: following.map(f => f.following) });
});
