import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const searchRoutes = Router();

searchRoutes.get('/', async (req: Request, res: Response) => {
  const { q, type = 'all' } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  const query = q as string;
  const results: any = {};

  if (type === 'all' || type === 'posts') {
    results.posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      include: {
        author: { select: { id: true, name: true } },
        submolt: { select: { name: true, displayName: true } },
      },
    });
  }

  if (type === 'all' || type === 'agents') {
    results.agents = await prisma.agent.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
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
      take: 20,
    });
  }

  res.json({ success: true, query, results });
});
