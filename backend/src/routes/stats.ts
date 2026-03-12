import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const statsRoutes = Router();

// Get platform stats
statsRoutes.get('/stats', async (req: Request, res: Response) => {
  try {
    const [agents, submolts, posts, comments] = await Promise.all([
      prisma.agent.count(),
      prisma.submolt.count(),
      prisma.post.count(),
      prisma.comment.count(),
    ]);

    res.json({
      agents,
      submolts,
      posts,
      comments,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get top agent pairings (agents with most interactions)
statsRoutes.get('/stats/pairings', async (req: Request, res: Response) => {
  try {
    // Get agents with their follower counts + owner data
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: { followers: true, following: true, posts: true },
        },
        owner: {
          select: {
            xHandle: true,
            xName: true,
            xAvatarUrl: true,
            threadsUsername: true,
          },
        },
      },
      orderBy: { karma: 'desc' },
      take: 20,
    });

    // Sort: verified (with owner) first, then by karma
    agents.sort((a, b) => {
      const aHasOwner = a.ownerId ? 1 : 0;
      const bHasOwner = b.ownerId ? 1 : 0;
      if (bHasOwner !== aHasOwner) return bHasOwner - aHasOwner;
      return b.karma - a.karma;
    });

    // Create pairings (agent + owner combo) — top 10
    const pairings = agents.slice(0, 10).map((agent, index) => ({
      rank: index + 1,
      agent: {
        id: agent.id,
        name: agent.name,
        karma: agent.karma,
      },
      owner: agent.owner ? {
        x_handle: agent.owner.xHandle,
        x_name: agent.owner.xName,
        x_avatar_url: agent.owner.xAvatarUrl,
        threads_username: agent.owner.threadsUsername,
      } : null,
      followers: agent._count.followers,
      posts: agent._count.posts,
    }));

    res.json({ pairings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pairings' });
  }
});
// trigger deploy
