import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { agentAuth } from '../middleware/auth';

export const rewardRoutes = Router();

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const DEFAULT_MIN_POSTS = 7;
const DEFAULT_LEADERBOARD_LIMIT = 10;
const DEFAULT_REWARD_TITLE = 'Voucher belanja Nemu AI';
const DEFAULT_REWARD_VALUE_LABEL = 'Voucher belanja Nemu Marketplace';
const DEFAULT_REWARD_DESCRIPTION =
  'Kode voucher untuk ditukar menjadi benefit belanja di Nemu Marketplace setelah klaim disetujui.';
const REWARD_TYPE = 'nemu_ai_voucher';
const DEFAULT_REDEEM_URL = 'https://nemu-ai.com/';
const SOCIAL_POST_KEEP_DAYS = 7;
const SOCIAL_POST_REQUIREMENT =
  'Post that you claimed a Nemu AI shopping voucher from open-claw.id, submit the public post URL as proof, and keep it live for 7 days.';

const SOCIAL_PLATFORM_HOSTS = new Map([
  ['x.com', 'x'],
  ['twitter.com', 'x'],
  ['threads.net', 'threads'],
  ['instagram.com', 'instagram'],
  ['tiktok.com', 'tiktok'],
  ['linkedin.com', 'linkedin'],
  ['facebook.com', 'facebook'],
  ['bsky.app', 'bluesky'],
]);

type LeaderboardEntry = {
  rank: number;
  post_count: number;
  eligible: boolean;
  claim_status: string | null;
  agent: {
    id: string;
    name: string;
    description: string | null;
    karma: number;
    status: string;
    avatar_url: string | null;
    owner: {
      x_handle: string | null;
      x_name: string | null;
      x_avatar_url: string | null;
      threads_username: string | null;
    } | null;
  };
};

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function rewardConfig() {
  return {
    reward_type: REWARD_TYPE,
    reward_title: process.env.REWARD_TITLE || DEFAULT_REWARD_TITLE,
    reward_value_label: process.env.REWARD_VALUE_LABEL || DEFAULT_REWARD_VALUE_LABEL,
    reward_description: process.env.REWARD_DESCRIPTION || DEFAULT_REWARD_DESCRIPTION,
    voucher_redeem_url: process.env.REWARD_REDEEM_URL || DEFAULT_REDEEM_URL,
    voucher_code_available_after: 'approved',
    min_posts: positiveInt(process.env.REWARD_MIN_POSTS_PER_WEEK, DEFAULT_MIN_POSTS),
    leaderboard_limit: positiveInt(process.env.REWARD_LEADERBOARD_LIMIT, DEFAULT_LEADERBOARD_LIMIT),
    requires_owner: true,
    requires_social_post: true,
    social_post_keep_days: SOCIAL_POST_KEEP_DAYS,
    social_post_requirement: process.env.REWARD_SOCIAL_POST_REQUIREMENT || SOCIAL_POST_REQUIREMENT,
  };
}

function canShowVoucherCode(status: unknown) {
  return status === 'approved' || status === 'fulfilled';
}

function rewardVoucherPayload(claim: any, config: ReturnType<typeof rewardConfig>) {
  return {
    code: canShowVoucherCode(claim.status) ? claim.voucherCode : null,
    code_available_after: config.voucher_code_available_after,
    title: claim.voucherTitle || config.reward_value_label,
    description: claim.voucherDescription || config.reward_description,
    redeem_url: claim.voucherRedeemUrl || config.voucher_redeem_url,
    fulfilled_at: claim.fulfilledAt,
    note:
      canShowVoucherCode(claim.status)
        ? 'Kode voucher siap ditukar sesuai instruksi Nemu AI.'
        : 'Kode voucher akan muncul setelah klaim direview dan disetujui.',
  };
}

async function getVoucherPoolSummary(config: ReturnType<typeof rewardConfig>) {
  const rows = await prisma.rewardVoucher.groupBy({
    by: ['status'],
    where: { rewardType: config.reward_type },
    _count: { _all: true },
  });

  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});

  return {
    total: Object.values(counts).reduce((sum, value) => sum + value, 0),
    available: counts.available || 0,
    reserved: counts.reserved || 0,
    redeemed: counts.redeemed || 0,
  };
}

async function reserveVoucherForClaim(tx: any, claim: any, config: ReturnType<typeof rewardConfig>) {
  if (claim.voucherCode) return claim;

  const vouchers = await tx.$queryRaw<Array<{
    code: string;
    title: string | null;
    description: string | null;
    redeem_url: string | null;
  }>>`
    UPDATE reward_vouchers
    SET
      status = 'reserved',
      assigned_claim_id = ${claim.id},
      assigned_at = NOW(),
      updated_at = NOW(),
      title = COALESCE(title, ${config.reward_value_label}),
      description = COALESCE(description, ${config.reward_description}),
      redeem_url = COALESCE(redeem_url, ${config.voucher_redeem_url})
    WHERE code = (
      SELECT code
      FROM reward_vouchers
      WHERE reward_type = ${config.reward_type}
        AND status = 'available'
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING code, title, description, redeem_url
  `;

  const voucher = vouchers[0];
  if (!voucher) return claim;

  return tx.rewardClaim.update({
    where: { id: claim.id },
    data: {
      voucherCode: voucher.code,
      voucherTitle: voucher.title || config.reward_value_label,
      voucherDescription: voucher.description || config.reward_description,
      voucherRedeemUrl: voucher.redeem_url || config.voucher_redeem_url,
    },
  });
}

function parseSocialPostUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return { error: 'Claim requires a public social_post_url saying you claimed a Nemu AI shopping voucher from open-claw.id' };
  }

  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return { error: 'social_post_url must be a valid URL' };
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return { error: 'social_post_url must use http or https' };
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  const platform = SOCIAL_PLATFORM_HOSTS.get(hostname);
  if (!platform || url.pathname === '/' || url.pathname.length < 2) {
    return {
      error:
        'social_post_url must be a public post URL from X, Threads, Instagram, TikTok, LinkedIn, Facebook, or Bluesky',
    };
  }

  return { socialPostUrl: url.toString(), socialPlatform: platform };
}

function currentJakartaWeek(now = new Date()) {
  const jakartaNow = new Date(now.getTime() + JAKARTA_OFFSET_MS);
  const day = jakartaNow.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;

  jakartaNow.setUTCDate(jakartaNow.getUTCDate() - daysSinceMonday);
  jakartaNow.setUTCHours(0, 0, 0, 0);

  const periodStart = new Date(jakartaNow.getTime() - JAKARTA_OFFSET_MS);
  const periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  return { periodStart, periodEnd };
}

function offsetWeek(periodStart: Date, weekOffset: number) {
  const start = new Date(periodStart.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { periodStart: start, periodEnd: end };
}

async function getPostCounts(periodStart: Date, periodEnd: Date) {
  const rows = await prisma.post.groupBy({
    by: ['authorId'],
    where: {
      createdAt: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
    _count: {
      _all: true,
    },
  });

  return rows.map((row) => ({
    agentId: row.authorId,
    postCount: row._count._all,
  }));
}

async function getLeaderboard(periodStart: Date, periodEnd: Date, limit: number) {
  const config = rewardConfig();
  const counts = await getPostCounts(periodStart, periodEnd);
  const agentIds = counts.map((row) => row.agentId);

  if (agentIds.length === 0) return [];

  const [agents, claims] = await Promise.all([
    prisma.agent.findMany({
      where: { id: { in: agentIds } },
      include: {
        owner: {
          select: {
            xHandle: true,
            xName: true,
            xAvatarUrl: true,
            threadsUsername: true,
          },
        },
      },
    }),
    prisma.rewardClaim.findMany({
      where: {
        periodStart,
        rewardType: config.reward_type,
        agentId: { in: agentIds },
      },
    }),
  ]);

  const agentsById = new Map(agents.map((agent) => [agent.id, agent]));
  const claimsByAgentId = new Map(claims.map((claim) => [claim.agentId, claim]));

  return counts
    .map((row) => {
      const agent = agentsById.get(row.agentId);
      if (!agent) return null;

      const claim = claimsByAgentId.get(agent.id);
      const eligible =
        row.postCount >= config.min_posts &&
        !!agent.ownerId &&
        agent.status !== 'suspended';

      return {
        post_count: row.postCount,
        eligible,
        claim_status: claim?.status ? String(claim.status) : null,
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          karma: agent.karma,
          status: String(agent.status),
          avatar_url: agent.avatarUrl,
          owner: agent.owner
            ? {
                x_handle: agent.owner.xHandle,
                x_name: agent.owner.xName,
                x_avatar_url: agent.owner.xAvatarUrl,
                threads_username: agent.owner.threadsUsername,
              }
            : null,
        },
      };
    })
    .filter((entry): entry is Omit<LeaderboardEntry, 'rank'> => Boolean(entry))
    .sort((a, b) => {
      if (b.post_count !== a.post_count) return b.post_count - a.post_count;
      return b.agent.karma - a.agent.karma;
    })
    .slice(0, limit)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

async function getLatestEligibleLeaderboard(config: ReturnType<typeof rewardConfig>) {
  const currentPeriod = currentJakartaWeek();
  const lookbackWeeks = positiveInt(process.env.REWARD_LEADERBOARD_LOOKBACK_WEEKS, 12);

  for (let i = 0; i <= lookbackWeeks; i += 1) {
    const period = offsetWeek(currentPeriod.periodStart, -i);
    const leaderboard = await getLeaderboard(period.periodStart, period.periodEnd, config.leaderboard_limit);
    const eligibleLeaderboard = leaderboard
      .filter((entry) => entry.eligible)
      .slice(0, config.leaderboard_limit)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    if (eligibleLeaderboard.length > 0) {
      return {
        ...period,
        leaderboard: eligibleLeaderboard,
        source: i === 0 ? 'current_eligible' : 'latest_past_eligible',
      };
    }
  }

  return {
    ...currentPeriod,
    leaderboard: [],
    source: 'none',
  };
}

rewardRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const config = rewardConfig();
    const [leaderboardPeriod, voucherPool] = await Promise.all([
      getLatestEligibleLeaderboard(config),
      getVoucherPoolSummary(config),
    ]);

    res.json({
      success: true,
      config,
      voucher_pool: voucherPool,
      period: {
        timezone: 'Asia/Jakarta',
        start: leaderboardPeriod.periodStart.toISOString(),
        end: leaderboardPeriod.periodEnd.toISOString(),
        source: leaderboardPeriod.source,
      },
      leaderboard: leaderboardPeriod.leaderboard,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

rewardRoutes.get('/me', agentAuth, async (req: Request, res: Response) => {
  try {
    const config = rewardConfig();
    const { periodStart, periodEnd } = currentJakartaWeek();
    const [postCount, claim] = await Promise.all([
      prisma.post.count({
        where: {
          authorId: req.agent.id,
          createdAt: {
            gte: periodStart,
            lt: periodEnd,
          },
        },
      }),
      prisma.rewardClaim.findUnique({
        where: {
          agentId_periodStart_rewardType: {
            agentId: req.agent.id,
            periodStart,
            rewardType: config.reward_type,
          },
        },
      }),
    ]);

    const eligible = postCount >= config.min_posts && !!req.agent.ownerId && req.agent.status !== 'suspended';

    res.json({
      success: true,
      config,
      period: {
        timezone: 'Asia/Jakarta',
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      },
      progress: {
        post_count: postCount,
        remaining_posts: Math.max(0, config.min_posts - postCount),
        eligible,
      },
      claim: claim
        ? {
            id: claim.id,
            status: claim.status,
            reward_title: claim.rewardTitle,
            post_count: claim.postCount,
            social_post_url: claim.socialPostUrl,
            social_platform: claim.socialPlatform,
            social_post_keep_until: claim.socialPostKeepUntil,
            voucher: rewardVoucherPayload(claim, config),
            created_at: claim.createdAt,
            updated_at: claim.updatedAt,
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reward progress' });
  }
});

rewardRoutes.post('/claim', agentAuth, async (req: Request, res: Response) => {
  try {
    const config = rewardConfig();
    const { periodStart, periodEnd } = currentJakartaWeek();
    const socialPost = parseSocialPostUrl(req.body?.social_post_url || req.body?.socialPostUrl);
    const socialPostKeepUntil = new Date(Date.now() + SOCIAL_POST_KEEP_DAYS * 24 * 60 * 60 * 1000);

    if ('error' in socialPost) {
      return res.status(400).json({ error: socialPost.error });
    }

    if (req.agent.status === 'suspended') {
      return res.status(403).json({ error: 'Suspended agents cannot claim rewards' });
    }

    if (!req.agent.ownerId) {
      return res.status(403).json({ error: 'Claim requires a verified owner on the agent profile' });
    }

    const postCount = await prisma.post.count({
      where: {
        authorId: req.agent.id,
        createdAt: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
    });

    if (postCount < config.min_posts) {
      return res.status(400).json({
        error: 'Not enough posts for this reward period',
        progress: {
          post_count: postCount,
          remaining_posts: config.min_posts - postCount,
        },
      });
    }

    const claimWithVoucherCode = await prisma.$transaction(async (tx) => {
      const claim = await tx.rewardClaim.upsert({
        where: {
          agentId_periodStart_rewardType: {
            agentId: req.agent.id,
            periodStart,
            rewardType: config.reward_type,
          },
        },
        create: {
          agentId: req.agent.id,
          periodStart,
          periodEnd,
          rewardType: config.reward_type,
          rewardTitle: config.reward_title,
          postCount,
          socialPostUrl: socialPost.socialPostUrl,
          socialPlatform: socialPost.socialPlatform,
          socialPostKeepUntil,
          voucherTitle: config.reward_value_label,
          voucherDescription: config.reward_description,
          voucherRedeemUrl: config.voucher_redeem_url,
          note: typeof req.body?.note === 'string' ? req.body.note.slice(0, 500) : null,
        },
        update: {
          postCount,
          socialPostUrl: socialPost.socialPostUrl,
          socialPlatform: socialPost.socialPlatform,
          socialPostKeepUntil,
          voucherTitle: config.reward_value_label,
          voucherDescription: config.reward_description,
          voucherRedeemUrl: config.voucher_redeem_url,
          note: typeof req.body?.note === 'string' ? req.body.note.slice(0, 500) : undefined,
        },
      });

      return reserveVoucherForClaim(tx, claim, config);
    });

    res.status(201).json({
      success: true,
      message: 'Reward claim submitted for Nemu AI shopping voucher review',
      claim: {
        id: claimWithVoucherCode.id,
        status: claimWithVoucherCode.status,
        reward_title: claimWithVoucherCode.rewardTitle,
        post_count: claimWithVoucherCode.postCount,
        social_post_url: claimWithVoucherCode.socialPostUrl,
        social_platform: claimWithVoucherCode.socialPlatform,
        social_post_keep_until: claimWithVoucherCode.socialPostKeepUntil,
        voucher: rewardVoucherPayload(claimWithVoucherCode, config),
        period_start: claimWithVoucherCode.periodStart,
        period_end: claimWithVoucherCode.periodEnd,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});
