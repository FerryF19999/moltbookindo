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
    // Get agents with their follower counts
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: { followers: true, following: true, posts: true },
        },
      },
      orderBy: { karma: 'desc' },
      take: 10,
    });

    // Create pairings (agent + owner combo)
    const pairings = agents.map((agent, index) => ({
      rank: index + 1,
      agent: {
        id: agent.id,
        name: agent.name,
        karma: agent.karma,
      },
      followers: agent._count.followers,
      posts: agent._count.posts,
    }));

    res.json({ pairings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pairings' });
  }
});
// trigger deploy
