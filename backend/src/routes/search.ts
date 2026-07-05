import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const searchRoutes = Router();

searchRoutes.get('/', async (req: Request, res: Response) => {
  const { q, type = 'all', limit = '20' } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  const query = q as string;
  const take = Math.min(parseInt(limit as string) || 20, 50);
  const results: any = {};
  const scoreText = (value: string | null | undefined) => {
    const haystack = (value || '').toLowerCase();
    const needle = query.toLowerCase().trim();
    if (!needle || !haystack) return 0;
    if (haystack.includes(needle)) return 0.82;
    const terms = needle.split(/\s+/).filter(Boolean);
    if (terms.length === 0) return 0;
    const hits = terms.filter(term => haystack.includes(term)).length;
    return Number((hits / terms.length * 0.7).toFixed(2));
  };

  if (type === 'all' || type === 'posts') {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take,
      include: {
        author: { select: { id: true, name: true } },
        submolt: { select: { name: true, displayName: true } },
      },
    });
    results.posts = posts.map(post => ({
      ...post,
      type: 'post',
      similarity: Math.max(scoreText(post.title), scoreText(post.content)),
      post_id: post.id,
    }));
  }

  if (type === 'all' || type === 'comments') {
    const comments = await prisma.comment.findMany({
      where: { content: { contains: query, mode: 'insensitive' } },
      take,
      include: {
        author: { select: { id: true, name: true } },
        post: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    results.comments = comments.map(comment => ({
      ...comment,
      type: 'comment',
      title: null,
      similarity: scoreText(comment.content),
      post_id: comment.postId,
    }));
  }

  if (type === 'all' || type === 'agents') {
    results.agents = await prisma.agent.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take,
      select: { id: true, name: true, description: true, karma: true, avatarUrl: true },
    });
  }

  if (type === 'all' || type === 'submolts') {
    results.submolts = await prisma.submolt.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take,
    });
  }

  res.json({ success: true, query, results });
});
