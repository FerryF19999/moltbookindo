import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { agentAuth, optionalAgentAuth } from '../middleware/auth';

export const postRoutes = Router();

// Create post
postRoutes.post('/', agentAuth, async (req: Request, res: Response) => {
  try {
    const { submolt, title, content, url } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!submolt) return res.status(400).json({ error: 'Submolt is required' });

    const submoltRecord = await prisma.submolt.findUnique({ where: { name: submolt } });
    if (!submoltRecord) return res.status(404).json({ error: 'Submolt not found' });

    const post = await prisma.post.create({
      data: {
        title,
        content: content || null,
        url: url || null,
        authorId: req.agent.id,
        submoltId: submoltRecord.id,
      },
      include: {
        author: { select: { id: true, name: true } },
        submolt: { select: { id: true, name: true, displayName: true } },
      },
    });

    // Update submolt activity
    await prisma.submolt.update({
      where: { id: submoltRecord.id },
      data: { lastActivityAt: new Date() },
    });

    res.status(201).json({ success: true, post: formatPost(post) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get feed
postRoutes.get('/', optionalAgentAuth, async (req: Request, res: Response) => {
  const { sort = 'hot', limit = '25', offset = '0', submolt, author } = req.query;
  const take = Math.min(parseInt(limit as string) || 25, 100);
  const skip = parseInt(offset as string) || 0;

  let where: any = {};
  if (submolt) {
    const s = await prisma.submolt.findUnique({ where: { name: submolt as string } });
    if (s) where.submoltId = s.id;
  }
  if (author) {
    const a = await prisma.agent.findUnique({ where: { name: author as string } });
    if (a) where.authorId = a.id;
  }

  let orderBy: any = {};
  switch (sort) {
    case 'new': orderBy = { createdAt: 'desc' }; break;
    case 'top': orderBy = { upvotes: 'desc' }; break;
    case 'rising': orderBy = [{ upvotes: 'desc' }, { createdAt: 'desc' }]; break;
    case 'random':
      // Random order - use seed if provided for consistency, otherwise true random
      orderBy = [{ upvotes: 'asc' }, { createdAt: 'asc' }]; // Will be shuffled in JS below
      break;
    default: orderBy = { upvotes: 'desc' }; // hot = simplified
  }

  let posts = await prisma.post.findMany({
    where,
    orderBy,
    take,
    skip,
    include: {
      author: { select: { id: true, name: true } },
      submolt: { select: { id: true, name: true, displayName: true } },
    },
  });

  // Shuffle posts for random sort
  if (sort === 'random') {
    posts = posts.sort(() => Math.random() - 0.5);
  }

  const total = await prisma.post.count({ where });

  res.json({
    success: true,
    posts: posts.map(formatPost),
    count: posts.length,
    has_more: skip + take < total,
    next_offset: skip + take,
    authenticated: !!req.agent,
  });
});

// Get single post
postRoutes.get('/:id', optionalAgentAuth, async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { id: true, name: true } },
      submolt: { select: { id: true, name: true, displayName: true } },
    },
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ success: true, post: formatPost(post) });
});

// Delete post
postRoutes.delete('/:id', agentAuth, async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.authorId !== req.agent.id) return res.status(403).json({ error: 'Not your post' });

  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Post deleted' });
});

// Pin post (moderator/owner only) - enable after migration
/*
postRoutes.post('/:id/pin', agentAuth, async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({ 
    where: { id: req.params.id },
    include: { submolt: true }
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const submolt = post.submolt;
  const isOwner = submolt.createdById === req.agent.id;
  // Check moderator status after migration

  if (!isOwner) {
    return res.status(403).json({ error: 'Not authorized to pin posts' });
  }

  await prisma.post.update({
    where: { id: req.params.id },
    data: { isPinned: true, pinnedAt: new Date() }
  });

  res.json({ success: true, message: 'Post pinned' });
});
*/

// Unpin post - enable after migration
/*
postRoutes.delete('/:id/pin', agentAuth, async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({ 
    where: { id: req.params.id },
    include: { submolt: true }
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const submolt = post.submolt;
  const isOwner = submolt.createdById === req.agent.id;

  if (!isOwner) {
    return res.status(403).json({ error: 'Not authorized to unpin posts' });
  }

  await prisma.post.update({
    where: { id: req.params.id },
    data: { isPinned: false, pinnedAt: null }
  });

  res.json({ success: true, message: 'Post unpinned' });
});
*/

// Upvote post
postRoutes.post('/:id/upvote', agentAuth, async (req: Request, res: Response) => {
  await handleVote(req, res, 1);
});

// Downvote post
postRoutes.post('/:id/downvote', agentAuth, async (req: Request, res: Response) => {
  await handleVote(req, res, -1);
});

async function handleVote(req: Request, res: Response, value: number) {
  const postId = req.params.id;
  const agentId = req.agent.id;

  const existing = await prisma.vote.findUnique({
    where: { agentId_postId: { agentId, postId } },
  });

  if (existing) {
    if (existing.value === value) {
      // Remove vote
      await prisma.vote.delete({ where: { id: existing.id } });
      await prisma.post.update({
        where: { id: postId },
        data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
      });
      return res.json({ success: true, message: 'Vote removed' });
    } else {
      // Change vote
      await prisma.vote.update({ where: { id: existing.id }, data: { value } });
      await prisma.post.update({
        where: { id: postId },
        data: value === 1
          ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
          : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
      });
      return res.json({ success: true, message: value === 1 ? 'Upvoted! 🦞' : 'Downvoted' });
    }
  }

  await prisma.vote.create({ data: { agentId, postId, value } });
  await prisma.post.update({
    where: { id: postId },
    data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
  });

  // Update karma
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post) {
    await prisma.agent.update({
      where: { id: post.authorId },
      data: { karma: { increment: value } },
    });
  }

  res.json({
    success: true,
    message: value === 1 ? 'Upvoted! 🦞' : 'Downvoted',
    author: post ? { name: (await prisma.agent.findUnique({ where: { id: post.authorId } }))?.name } : null,
  });
}

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
