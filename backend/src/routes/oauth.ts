import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { prisma } from '../utils/prisma';
import { isValidClaimToken, sanitizeString } from '../utils/validation';

export const oauthRoutes = Router();

type SessionData = {
  oauthState?: string;
  oauthProvider?: 'x' | 'threads';
  oauthClaimToken?: string;
  oauthCodeVerifier?: string;
  ownerId?: string;
  xAccessToken?: string;
  threadsAccessToken?: string;
};

function getSession(req: Request): SessionData {
  return ((req as any).session || {}) as SessionData;
}

function appBaseUrl(req: Request): string {
  return process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

function randomString(size = 32) {
  return crypto.randomBytes(size).toString('hex');
}

function toBase64Url(buffer: Buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function createPkcePair() {
  const verifier = toBase64Url(crypto.randomBytes(32));
  const challenge = toBase64Url(crypto.createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

oauthRoutes.get('/x/start', asyncHandler(async (req: Request, res: Response) => {
  const claimToken = sanitizeString(req.query.claim_token);
  if (!isValidClaimToken(claimToken)) return res.status(400).json({ error: 'Invalid claim token format' });

  const state = randomString(16);
  const { verifier, challenge } = createPkcePair();
  const session = getSession(req);
  session.oauthState = state;
  session.oauthProvider = 'x';
  session.oauthClaimToken = claimToken;
  session.oauthCodeVerifier = verifier;

  const callbackUrl = `${appBaseUrl(req)}/api/v1/oauth/x/callback`;
  const query = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.X_CLIENT_ID || '',
    redirect_uri: callbackUrl,
    scope: 'tweet.read users.read offline.access',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  res.redirect(`https://twitter.com/i/oauth2/authorize?${query.toString()}`);
}));

oauthRoutes.get('/x/callback', asyncHandler(async (req: Request, res: Response) => {
  const code = sanitizeString(req.query.code);
  const state = sanitizeString(req.query.state);
  const session = getSession(req);

  if (!code || !state || state !== session.oauthState || session.oauthProvider !== 'x' || !session.oauthCodeVerifier) {
    return res.status(400).json({ error: 'Invalid OAuth state' });
  }

  const callbackUrl = `${appBaseUrl(req)}/api/v1/oauth/x/callback`;
  const tokenRes = await axios.post(
    'https://api.twitter.com/2/oauth2/token',
    new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: process.env.X_CLIENT_ID || '',
      redirect_uri: callbackUrl,
      code_verifier: session.oauthCodeVerifier,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString('base64')}`,
      },
    },
  );

  const accessToken = tokenRes.data?.access_token;
  const me = await axios.get('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const user = me.data?.data;
  if (!user?.id) return res.status(400).json({ error: 'Unable to fetch X profile' });

  let ownerId = session.ownerId;
  if (ownerId) {
    await prisma.owner.update({
      where: { id: ownerId },
      data: { xUserId: user.id, xHandle: user.username, xName: user.name, xAvatarUrl: user.profile_image_url || null },
    });
  } else {
    const owner = await prisma.owner.upsert({
      where: { xUserId: user.id },
      update: { xHandle: user.username, xName: user.name, xAvatarUrl: user.profile_image_url || null },
      create: {
        email: `${user.username}-${user.id}@x.placeholder.local`,
        xUserId: user.id,
        xHandle: user.username,
        xName: user.name,
        xAvatarUrl: user.profile_image_url || null,
      },
    });
    ownerId = owner.id;
    session.ownerId = owner.id;
  }

  session.xAccessToken = accessToken;
  session.oauthState = undefined;
  session.oauthProvider = undefined;
  session.oauthCodeVerifier = undefined;
  res.redirect(`${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/claim/${session.oauthClaimToken || ''}?x_connected=true`);
}));

oauthRoutes.get('/threads/start', asyncHandler(async (req: Request, res: Response) => {
  const claimToken = sanitizeString(req.query.claim_token);
  if (!isValidClaimToken(claimToken)) return res.status(400).json({ error: 'Invalid claim token format' });

  const state = randomString(16);
  const session = getSession(req);
  session.oauthState = state;
  session.oauthProvider = 'threads';
  session.oauthClaimToken = claimToken;

  const callbackUrl = `${appBaseUrl(req)}/api/v1/oauth/threads/callback`;
  const query = new URLSearchParams({
    client_id: process.env.THREADS_CLIENT_ID || '',
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'threads_basic,threads_content_publish',
    state,
  });

  res.redirect(`https://threads.net/oauth/authorize?${query.toString()}`);
}));

oauthRoutes.get('/threads/callback', asyncHandler(async (req: Request, res: Response) => {
  const code = sanitizeString(req.query.code);
  const state = sanitizeString(req.query.state);
  const session = getSession(req);

  if (!code || !state || state !== session.oauthState || session.oauthProvider !== 'threads') {
    return res.status(400).json({ error: 'Invalid OAuth state' });
  }

  const callbackUrl = `${appBaseUrl(req)}/api/v1/oauth/threads/callback`;
  const tokenRes = await axios.post('https://graph.threads.net/oauth/access_token', new URLSearchParams({
    client_id: process.env.THREADS_CLIENT_ID || '',
    client_secret: process.env.THREADS_CLIENT_SECRET || '',
    grant_type: 'authorization_code',
    redirect_uri: callbackUrl,
    code,
  }));

  const accessToken = tokenRes.data?.access_token;
  const me = await axios.get('https://graph.threads.net/v1.0/me', {
    params: {
      fields: 'id,username',
      access_token: accessToken,
    },
  });

  const user = me.data;
  if (!user?.id) return res.status(400).json({ error: 'Unable to fetch Threads profile' });

  let ownerId = session.ownerId;
  if (ownerId) {
    await prisma.owner.update({
      where: { id: ownerId },
      data: { threadsUserId: user.id, threadsUsername: user.username },
    });
  } else {
    const owner = await prisma.owner.upsert({
      where: { threadsUserId: user.id },
      update: { threadsUsername: user.username },
      create: {
        email: `${user.username}-${user.id}@threads.placeholder.local`,
        threadsUserId: user.id,
        threadsUsername: user.username,
      },
    });
    ownerId = owner.id;
    session.ownerId = owner.id;
  }

  session.threadsAccessToken = accessToken;
  session.oauthState = undefined;
  session.oauthProvider = undefined;
  res.redirect(`${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/claim/${session.oauthClaimToken || ''}?threads_connected=true`);
}));

oauthRoutes.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const session = getSession(req);
  if (!session.ownerId) return res.status(401).json({ authenticated: false });

  const owner = await prisma.owner.findUnique({
    where: { id: session.ownerId },
    select: {
      id: true,
      email: true,
      xUserId: true,
      xHandle: true,
      xAvatarUrl: true,
      threadsUserId: true,
      threadsUsername: true,
      emailVerifiedAt: true,
    },
  });

  if (!owner) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, owner });
}));

oauthRoutes.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('OAuth route error:', err?.message || err);
  const status = err?.response?.status && err.response.status >= 400 && err.response.status < 500 ? 400 : 500;
  return res.status(status).json({ error: status === 400 ? 'OAuth request failed' : 'Internal server error' });
});
