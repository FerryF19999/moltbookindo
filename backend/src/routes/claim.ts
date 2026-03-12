import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { prisma } from '../utils/prisma';

export const claimRoutes = Router();

type SessionData = {
  ownerId?: string;
  claimToken?: string;
  xAccessToken?: string;
  threadsAccessToken?: string;
};

function getSession(req: Request): SessionData {
  return ((req as any).session || {}) as SessionData;
}

function getVerificationTemplate(agentName: string, code: string, provider: 'x' | 'threads') {
  if (provider === 'x') {
    return `I'm claiming my AI agent "${agentName}" on @openclawid 🦞\nVerification: ${code}`;
  }
  return `I'm claiming my AI agent "${agentName}" on open-claw.id\nVerification: ${code}`;
}

async function findAgentByClaimToken(claimToken?: string | null) {
  if (!claimToken) return null;
  return prisma.agent.findUnique({ where: { claimCode: claimToken } });
}

function ensureClaimNotExpired(agent: any) {
  if (agent.claimExpiresAt && new Date(agent.claimExpiresAt).getTime() < Date.now()) {
    return 'Claim token expired';
  }
  return null;
}

async function saveArtifact(input: {
  agentId: string;
  ownerId: string;
  provider: 'x' | 'threads';
  postId: string;
  postUrl: string;
  content: string;
  rawPayload: any;
}) {
  const contentHash = crypto.createHash('sha256').update(input.content).digest('hex');
  return prisma.verificationArtifact.upsert({
    where: {
      provider_postId: {
        provider: input.provider,
        postId: input.postId,
      },
    },
    update: {
      postUrl: input.postUrl,
      contentHash,
      rawPayload: input.rawPayload,
      verifiedAt: new Date(),
    },
    create: {
      agentId: input.agentId,
      ownerId: input.ownerId,
      provider: input.provider,
      postId: input.postId,
      postUrl: input.postUrl,
      contentHash,
      rawPayload: input.rawPayload,
    },
  });
}

claimRoutes.get('/claim', async (req: Request, res: Response) => {
  const claimToken = (req.query.claim_token as string) || '';
  const agent = await findAgentByClaimToken(claimToken);
  if (!agent) return res.status(404).json({ error: 'Invalid claim token' });

  const expiredError = ensureClaimNotExpired(agent);
  if (expiredError) return res.status(400).json({ error: expiredError });

  res.json({
    success: true,
    agent: {
      id: agent.id,
      name: agent.name,
      status: agent.status,
      verification_code: agent.verificationCode,
      claim_expires_at: agent.claimExpiresAt,
    },
    requirements: {
      email: true,
      x: true,
      threads_optional: true,
      final_rule: 'At least one social proof (X or Threads) is required.',
    },
  });
});

claimRoutes.post('/verify-email', async (req: Request, res: Response) => {
  const { claim_token, email, username } = req.body;
  if (!claim_token || !email || !username) {
    return res.status(400).json({ error: 'claim_token, email, and username are required' });
  }

  const agent = await findAgentByClaimToken(claim_token);
  if (!agent) return res.status(404).json({ error: 'Invalid claim token' });
  const expiredError = ensureClaimNotExpired(agent);
  if (expiredError) return res.status(400).json({ error: expiredError });

  let owner = await prisma.owner.findUnique({ where: { email } });
  if (!owner) {
    owner = await prisma.owner.create({
      data: {
        email,
        xHandle: username,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
  } else {
    owner = await prisma.owner.update({
      where: { id: owner.id },
      data: {
        xHandle: owner.xHandle || username,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
  }

  await prisma.agent.update({
    where: { id: agent.id },
    data: {
      ownerId: owner.id,
      status: 'email_verified',
    },
  });

  const session = getSession(req);
  session.ownerId = owner.id;
  session.claimToken = claim_token;

  res.json({ success: true, status: 'email_verified', owner: { id: owner.id, email: owner.email } });
});

claimRoutes.post('/verify-tweet', async (req: Request, res: Response) => {
  const claimToken = req.body.claim_token || getSession(req).claimToken;
  const session = getSession(req);
  if (!session.ownerId || !session.xAccessToken) {
    return res.status(401).json({ error: 'Connect X account first' });
  }

  const agent = await findAgentByClaimToken(claimToken);
  if (!agent) return res.status(404).json({ error: 'Invalid claim token' });

  const owner = await prisma.owner.findUnique({ where: { id: session.ownerId } });
  if (!owner?.xUserId) return res.status(401).json({ error: 'X OAuth identity not found' });

  const template = getVerificationTemplate(agent.name, agent.verificationCode || '', 'x');

  const { data } = await axios.get('https://api.twitter.com/2/users/me/tweets', {
    headers: { Authorization: `Bearer ${session.xAccessToken}` },
    params: { max_results: 10, 'tweet.fields': 'created_at,text' },
  });

  const tweets = data?.data || [];
  const matched = tweets.find((t: any) => t.text?.includes(template));
  if (!matched) {
    return res.status(400).json({ error: 'Verification tweet not found in recent posts' });
  }

  await saveArtifact({
    agentId: agent.id,
    ownerId: owner.id,
    provider: 'x',
    postId: matched.id,
    postUrl: `https://x.com/${owner.xHandle || 'i'}/status/${matched.id}`,
    content: matched.text,
    rawPayload: matched,
  });

  await prisma.agent.update({ where: { id: agent.id }, data: { status: 'x_verified' } });
  res.json({ success: true, status: 'x_verified', post_id: matched.id });
});

claimRoutes.post('/verify-threads', async (req: Request, res: Response) => {
  const claimToken = req.body.claim_token || getSession(req).claimToken;
  const session = getSession(req);
  if (!session.ownerId || !session.threadsAccessToken) {
    return res.status(401).json({ error: 'Connect Threads account first' });
  }

  const agent = await findAgentByClaimToken(claimToken);
  if (!agent) return res.status(404).json({ error: 'Invalid claim token' });

  const owner = await prisma.owner.findUnique({ where: { id: session.ownerId } });
  if (!owner?.threadsUserId) return res.status(401).json({ error: 'Threads OAuth identity not found' });

  const template = getVerificationTemplate(agent.name, agent.verificationCode || '', 'threads');

  const { data } = await axios.get(`https://graph.threads.net/v1.0/${owner.threadsUserId}/threads`, {
    params: {
      access_token: session.threadsAccessToken,
      fields: 'id,text,timestamp,permalink',
      limit: 10,
    },
  });

  const posts = data?.data || [];
  const matched = posts.find((p: any) => p.text?.includes(template));
  if (!matched) {
    return res.status(400).json({ error: 'Verification post not found in recent Threads posts' });
  }

  await saveArtifact({
    agentId: agent.id,
    ownerId: owner.id,
    provider: 'threads',
    postId: matched.id,
    postUrl: matched.permalink || `https://www.threads.net/@${owner.threadsUsername}/post/${matched.id}`,
    content: matched.text,
    rawPayload: matched,
  });

  await prisma.agent.update({ where: { id: agent.id }, data: { status: 'threads_verified' } });
  res.json({ success: true, status: 'threads_verified', post_id: matched.id });
});

claimRoutes.post('/claim/complete', async (req: Request, res: Response) => {
  const claimToken = req.body.claim_token || getSession(req).claimToken;
  const session = getSession(req);
  if (!session.ownerId) return res.status(401).json({ error: 'Email verification required' });

  const agent = await findAgentByClaimToken(claimToken);
  if (!agent) return res.status(404).json({ error: 'Invalid claim token' });

  const artifacts = await prisma.verificationArtifact.count({
    where: {
      agentId: agent.id,
      ownerId: session.ownerId,
      provider: { in: ['x', 'threads'] },
    },
  });

  if (artifacts < 1) {
    return res.status(400).json({ error: 'At least one social proof (X or Threads) is required' });
  }

  const updated = await prisma.agent.update({
    where: { id: agent.id },
    data: {
      ownerId: session.ownerId,
      status: 'claimed',
      claimedAt: new Date(),
      claimCode: null,
    },
  });

  res.json({ success: true, status: updated.status, agent_id: updated.id, claimed_at: updated.claimedAt });
});
