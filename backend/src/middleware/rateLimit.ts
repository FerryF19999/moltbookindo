import { Request, Response, NextFunction } from 'express';
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
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const agentId = (req as any).agent?.id;
    if (!agentId) return next(); // Skip if no auth

    const key = `${options.keyPrefix}:${agentId}`;
    const now = Date.now();
    const windowStart = now - options.windowMs;

    let data = rateStore.get(key);
    if (!data || data.resetTime < now) {
      data = { count: 0, resetTime: now + options.windowMs };
    }

    if (data.count >= options.maxRequests) {
      const retryAfter = Math.ceil((data.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retry_after_seconds: retryAfter,
      });
    }

    data.count++;
    rateStore.set(key, data);
    next();
  };
}

// Post rate limit: 1 post per 30 minutes
export const postRateLimit = createRateLimit({
  windowMs: 30 * 60 * 1000,
  maxRequests: 1,
  keyPrefix: 'post',
});

// Comment rate limit: 1 comment per 20 seconds, 50 per day
export const commentRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const agentId = (req as any).agent?.id;
  if (!agentId) return next();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Check daily limit
  const dailyCount = await prisma.comment.count({
    where: {
      authorId: agentId,
      createdAt: { gte: today },
    },
  });

  if (dailyCount >= 50) {
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
    const cooldown = 20 * 1000; // 20 seconds

    if (elapsed < cooldown) {
      const retryAfter = Math.ceil((cooldown - elapsed) / 1000);
      return res.status(429).json({
        success: false,
        error: 'Comment cooldown active',
        retry_after_seconds: retryAfter,
        daily_remaining: 50 - dailyCount,
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
