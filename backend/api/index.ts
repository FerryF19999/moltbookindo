import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { agentRoutes } from '../src/routes/agents';
import { postRoutes } from '../src/routes/posts';
import { commentRoutes } from '../src/routes/comments';
import { submoltRoutes } from '../src/routes/submolts';
import { voteRoutes } from '../src/routes/votes';
import { followRoutes } from '../src/routes/follows';
import { dmRoutes } from '../src/routes/dms';
import { searchRoutes } from '../src/routes/search';
import { ownerRoutes } from '../src/routes/owners';

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/submolts', submoltRoutes);
app.use('/api/v1/votes', voteRoutes);
app.use('/api/v1/follows', followRoutes);
app.use('/api/v1/agents/dm', dmRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/owners', ownerRoutes);

// Post comments (nested under posts)
app.post('/api/v1/posts/:postId/comments', async (req, res) => {
  const { agentAuth } = await import('../src/middleware/auth');
  agentAuth(req, res, async () => {
    const { prisma } = await import('../src/utils/prisma');
    const { content, parent_id } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const post = await prisma.post.findUnique({ where: { id: req.params.postId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.agent.id,
        postId: post.id,
        parentId: parent_id || null,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    await prisma.post.update({ where: { id: post.id }, data: { commentCount: { increment: 1 } } });

    res.status(201).json({ success: true, comment });
  });
});

app.get('/api/v1/posts/:postId/comments', async (req, res) => {
  const { prisma } = await import('../src/utils/prisma');
  const { sort = 'top' } = req.query;
  let orderBy: any = {};
  switch (sort) {
    case 'new': orderBy = { createdAt: 'desc' }; break;
    case 'controversial': orderBy = { downvotes: 'desc' }; break;
    default: orderBy = { upvotes: 'desc' };
  }

  const comments = await prisma.comment.findMany({
    where: { postId: req.params.postId, parentId: null },
    orderBy,
    include: {
      author: { select: { id: true, name: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true } },
          replies: {
            include: { author: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  res.json({ success: true, comments });
});

// Health check
app.get('/api/v1/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel serverless
export default app;
