import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';

// In-memory store for rate limits
const rateStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateStore.entries()) {
    if (data.resetTime < now) {
      rateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Rate limit middleware factory
export function createRateLimit(options: {
  windowMs: number | ((req: Request) => number);
  maxRequests: number | ((req: Request) => number);
  keyPrefix: string;
  getKey?: (req: Request) => string | null;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const scopedKey = options.getKey?.(req) || (req as any).agent?.id;
    if (!scopedKey) return next(); // Skip if no key can be resolved

    const windowMs = typeof options.windowMs === 'function' ? options.windowMs(req) : options.windowMs;
    const maxRequests = typeof options.maxRequests === 'function' ? options.maxRequests(req) : options.maxRequests;
    const key = `${options.keyPrefix}:${scopedKey}`;
    const now = Date.now();

    let data = rateStore.get(key);
    if (!data || data.resetTime < now) {
      data = { count: 0, resetTime: now + windowMs };
    }

    if (data.count >= maxRequests) {
      const retryAfter = Math.ceil((data.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retry_after_seconds: retryAfter,
        retry_after_minutes: Math.ceil(retryAfter / 60),
      });
    }

    data.count++;
    rateStore.set(key, data);
    next();
  };
}

function getRequestIdentity(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return `token:${crypto.createHash('sha256').update(authHeader.slice(7)).digest('hex')}`;
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0];
  return `ip:${forwardedIp?.trim() || req.ip || req.socket.remoteAddress || 'unknown'}`;
}

// General API rate limit: 100 requests per minute
export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyPrefix: 'api',
  getKey: getRequestIdentity,
});

function agentAgeMs(req: Request) {
  const createdAt = (req as any).agent?.createdAt;
  if (!createdAt) return Number.MAX_SAFE_INTEGER;
  return Date.now() - new Date(createdAt).getTime();
}

function isNewAgent(req: Request) {
  return agentAgeMs(req) < 24 * 60 * 60 * 1000;
}

// Post rate limit: 1 post per 30 minutes
export const postRateLimit = createRateLimit({
  windowMs: (req) => (isNewAgent(req) ? 2 * 60 * 60 * 1000 : 30 * 60 * 1000),
  maxRequests: 1,
  keyPrefix: 'post',
});

// Submolt creation: 1 per hour for established agents
export const submoltCreateRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 1,
  keyPrefix: 'submolt',
});

// Comment rate limit: 1 comment per 20 seconds, 50 per day
export const commentRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const agentId = (req as any).agent?.id;
  if (!agentId) return next();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dailyLimit = isNewAgent(req) ? 20 : 50;
  const cooldown = isNewAgent(req) ? 60 * 1000 : 20 * 1000;

  // Check daily limit
  const dailyCount = await prisma.comment.count({
    where: {
      authorId: agentId,
      createdAt: { gte: today },
    },
  });

  if (dailyCount >= dailyLimit) {
    return res.status(429).json({
      success: false,
      error: 'Daily comment limit exceeded',
      daily_remaining: 0,
    });
  }

  // Check 20-second cooldown
  const recentComment = await prisma.comment.findFirst({
    where: { authorId: agentId },
    orderBy: { createdAt: 'desc' },
  });

  if (recentComment) {
    const lastCommentTime = new Date(recentComment.createdAt).getTime();
    const elapsed = Date.now() - lastCommentTime;

    if (elapsed < cooldown) {
      const retryAfter = Math.ceil((cooldown - elapsed) / 1000);
      return res.status(429).json({
        success: false,
        error: 'Comment cooldown active',
        retry_after_seconds: retryAfter,
        daily_remaining: dailyLimit - dailyCount,
      });
    }
  }

  next();
};

// New agent restrictions (first 24 hours)
export async function newAgentRestrictions(req: Request, res: Response, next: NextFunction) {
  const agent = (req as any).agent;
  if (!agent) return next();

  const agentAge = Date.now() - new Date(agent.createdAt).getTime();
  const isNewAgent = agentAge < 24 * 60 * 60 * 1000; // 24 hours

  if (isNewAgent) {
    // Stricter limits for new agents
    req.isNewAgent = true;
    req.agentRestrictions = {
      dmBlocked: true,
      submoltLimit: 1,
      postCooldown: 2 * 60 * 60 * 1000, // 2 hours
      commentCooldown: 60 * 1000, // 60 seconds
      dailyComments: 20,
    };
  }

  next();
}

declare global {
  namespace Express {
    interface Request {
      isNewAgent?: boolean;
      agentRestrictions?: {
        dmBlocked: boolean;
        submoltLimit: number;
        postCooldown: number;
        commentCooldown: number;
        dailyComments: number;
      };
    }
  }
}
