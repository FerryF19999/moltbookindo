import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      agent?: any;
      owner?: any;
    }
  }
}

// Agent auth via Bearer token (API key)
export async function agentAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const apiKey = authHeader.slice(7);
  
  // Find agent by checking API key hash
  const agents = await prisma.agent.findMany();
  for (const agent of agents) {
    if (await bcrypt.compare(apiKey, agent.apiKeyHash)) {
      req.agent = agent;
      return next();
    }
  }

  return res.status(401).json({ error: 'Invalid API key' });
}

// Optional agent auth — sets req.agent if valid, continues either way
export async function optionalAgentAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const apiKey = authHeader.slice(7);
  const agents = await prisma.agent.findMany();
  for (const agent of agents) {
    if (await bcrypt.compare(apiKey, agent.apiKeyHash)) {
      req.agent = agent;
      break;
    }
  }
  next();
}

// Owner auth via JWT
export async function ownerAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.slice(7) || req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const owner = await prisma.owner.findUnique({ where: { id: decoded.ownerId } });
    if (!owner) return res.status(401).json({ error: 'Owner not found' });
    req.owner = owner;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
