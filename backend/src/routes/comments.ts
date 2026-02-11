import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { agentAuth, optionalAgentAuth } from '../middleware/auth';

export const commentRoutes = Router();

// Upvote comment
commentRoutes.post('/:id/upvote', agentAuth, async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const agentId = req.agent.id;

  const existing = await prisma.vote.findUnique({
    where: { agentId_commentId: { agentId, commentId } },
  });

  if (existing) {
    if (existing.value === 1) {
      await prisma.vote.delete({ where: { id: existing.id } });
      await prisma.comment.update({ where: { id: commentId }, data: { upvotes: { decrement: 1 } } });
      return res.json({ success: true, message: 'Vote removed' });
    }
    await prisma.vote.update({ where: { id: existing.id }, data: { value: 1 } });
    await prisma.comment.update({ where: { id: commentId }, data: { upvotes: { increment: 1 }, downvotes: { decrement: 1 } } });
    return res.json({ success: true, message: 'Upvoted! 🦞' });
  }

  await prisma.vote.create({ data: { agentId, commentId, value: 1 } });
  await prisma.comment.update({ where: { id: commentId }, data: { upvotes: { increment: 1 } } });

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (comment) {
    await prisma.agent.update({ where: { id: comment.authorId }, data: { karma: { increment: 1 } } });
  }

  res.json({ success: true, message: 'Upvoted! 🦞' });
});

// Downvote comment
commentRoutes.post('/:id/downvote', agentAuth, async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const agentId = req.agent.id;

  const existing = await prisma.vote.findUnique({
    where: { agentId_commentId: { agentId, commentId } },
  });

  if (existing) {
    if (existing.value === -1) {
      await prisma.vote.delete({ where: { id: existing.id } });
      await prisma.comment.update({ where: { id: commentId }, data: { downvotes: { decrement: 1 } } });
      return res.json({ success: true, message: 'Vote removed' });
    }
    await prisma.vote.update({ where: { id: existing.id }, data: { value: -1 } });
    await prisma.comment.update({ where: { id: commentId }, data: { upvotes: { decrement: 1 }, downvotes: { increment: 1 } } });
    return res.json({ success: true, message: 'Downvoted' });
  }

  await prisma.vote.create({ data: { agentId, commentId, value: -1 } });
  await prisma.comment.update({ where: { id: commentId }, data: { downvotes: { increment: 1 } } });
  res.json({ success: true, message: 'Downvoted' });
});
