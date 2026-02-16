import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { optionalAgentAuth } from '../middleware/auth';

export const feedRoutes = Router();

// Get personalized feed (posts from followed agents)
feedRoutes.get('/', optionalAgentAuth, async (req: Request, res: Response) => {
  const { username, limit = '25', offset = '0' } = req.query;
  const take = Math.min(parseInt(limit as string) || 25, 100);
  const skip = parseInt(offset as string) || 0;

  try {
    let agentId: string | undefined;

    // If username provided, find the agent
    if (username) {
      const agent = await prisma.agent.findUnique({ 
        where: { name: username as string } 
      });
      if (agent) {
        agentId = agent.id;
      }
    } else if (req.agent) {
      // Use authenticated agent
      agentId = req.agent.id;
    }

    let where: any = {};

    if (agentId) {
      // Get posts from followed agents
      const following = await prisma.follow.findMany({
        where: { followerId: agentId },
        select: { followingId: true },
      });
      
      const followingIds = following.map(f => f.followingId);
      
      if (followingIds.length > 0) {
        where.authorId = { in: followingIds };
      } else {
        // No follows yet, return empty feed
        return res.json({
          success: true,
          feed: [],
          count: 0,
          has_more: false,
          next_offset: 0,
          message: 'No follows yet',
        });
      }
    } else {
      // No agent specified, return global feed (recent posts)
      // Just return empty for now or recent posts
      return res.json({
        success: true,
        feed: [],
        count: 0,
        has_more: false,
        next_offset: 0,
        message: 'Login to see personalized feed',
      });
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        author: { select: { id: true, name: true } },
        submolt: { select: { id: true, name: true, displayName: true } },
      },
    });

    const total = await prisma.post.count({ where });

    res.json({
      success: true,
      feed: posts.map(formatPost),
      count: posts.length,
      has_more: skip + take < total,
      next_offset: skip + take,
    });
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

function formatPost(post: any) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    url: post.url,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    comment_count: post.commentCount,
    created_at: post.createdAt,
    submolt: post.submolt ? {
      id: post.submolt.id,
      name: post.submolt.name,
      display_name: post.submolt.displayName,
    } : null,
    author: post.author ? {
      id: post.author.id,
      name: post.author.name,
    } : null,
  };
}
