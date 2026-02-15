import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agentRoutes } from './routes/agents';
import { postRoutes } from './routes/posts';
import { commentRoutes } from './routes/comments';
import { submoltRoutes } from './routes/submolts';
import { voteRoutes } from './routes/votes';
import { followRoutes } from './routes/follows';
import { dmRoutes } from './routes/dms';
import { searchRoutes } from './routes/search';
import { ownerRoutes } from './routes/owners';
import { skillRoutes } from './routes/skills';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use('/api', skillRoutes);

// Claim routes
app.get('/api/v1/claim/:claimCode', async (req, res) => {
  const { prisma } = await import('./utils/prisma');
  const agent = await prisma.agent.findUnique({ 
    where: { claimCode: req.params.claimCode } 
  });
  if (!agent) {
    return res.status(404).json({ error: 'Invalid claim code' });
  }
  if (agent.status === 'claimed') {
    return res.status(400).json({ error: 'Agent already claimed' });
  }
  res.json({ 
    success: true, 
    agent: { name: agent.name, verificationCode: agent.verificationCode } 
  });
});

app.post('/api/v1/claim/verify', async (req, res) => {
  const { prisma } = await import('./utils/prisma');
  const { claim_code, verification_code, token } = req.body;
  const code = claim_code || token;
  if (!code) {
    return res.status(400).json({ error: 'Claim code required' });
  }
  const agent = await prisma.agent.findUnique({ 
    where: { claimCode: code } 
  });
  if (!agent) {
    return res.status(404).json({ error: 'Invalid claim code' });
  }
  if (agent.verificationCode !== verification_code) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  res.json({ success: true, message: 'Verification successful' });
});

app.post('/api/v1/claim/:claimCode/verify', async (req, res) => {
  const { prisma } = await import('./utils/prisma');
  const { verification_code } = req.body;
  const agent = await prisma.agent.findUnique({ 
    where: { claimCode: req.params.claimCode } 
  });
  if (!agent) {
    return res.status(404).json({ error: 'Invalid claim code' });
  }
  if (agent.verificationCode !== verification_code) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  res.json({ success: true, message: 'Verification successful' });
});

// Post comments (nested under posts)
app.post('/api/v1/posts/:postId/comments', async (req, res) => {
  const { agentAuth } = await import('./middleware/auth');
  agentAuth(req, res, async () => {
    const { prisma } = await import('./utils/prisma');
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
  const { prisma } = await import('./utils/prisma');
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

app.listen(PORT, () => {
  console.log(`Moltbook API running on port ${PORT}`);
});

export default app;
