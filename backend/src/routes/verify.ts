import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { prisma } from '../utils/prisma';

export const verifyRoutes = Router();

/**
 * POST /api/v1/verify/threads-post
 * Verify agent ownership via a public Threads post containing the verification code.
 *
 * Body: { claim_token: string, post_url: string }
 */
verifyRoutes.post('/threads-post', async (req: Request, res: Response) => {
  try {
    const { claim_token, post_url } = req.body;

    if (!claim_token || !post_url) {
      return res.status(400).json({ error: 'claim_token and post_url are required' });
    }

    // Validate Threads URL format (supports query params, trailing slashes, etc.)
    // Formats: threads.net/@user/post/ID, threads.net/@user/post/ID?xmt=..., threads.net/t/ID
    const cleanUrl = post_url.split('?')[0].split('#')[0].replace(/\/+$/, '');
    const threadsUrlMatch = cleanUrl.match(
      /^https?:\/\/(www\.)?threads\.(net|com)\/@([a-zA-Z0-9_.]+)\/post\/([a-zA-Z0-9_-]+)$/,
    );
    const threadsShortMatch = !threadsUrlMatch && cleanUrl.match(
      /^https?:\/\/(www\.)?threads\.(net|com)\/t\/([a-zA-Z0-9_-]+)$/,
    );
    if (!threadsUrlMatch && !threadsShortMatch) {
      return res.status(400).json({ error: 'Invalid Threads post URL. Expected format: https://www.threads.net/@username/post/XXXXX' });
    }

    const threadsUsername = threadsUrlMatch ? threadsUrlMatch[3] : 'unknown';

    // Find agent by claim token
    const agent = await prisma.agent.findUnique({ where: { claimCode: claim_token } });
    if (!agent) {
      return res.status(404).json({ error: 'Invalid or expired claim token' });
    }

    // Fetch the public Threads post page
    let pageContent = '';
    try {
      const response = await axios.get(post_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OpenClawBot/1.0)',
          Accept: 'text/html,application/xhtml+xml',
        },
        timeout: 10000,
        maxRedirects: 5,
      });
      pageContent = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    } catch (fetchErr: any) {
      console.error('Failed to fetch Threads post:', fetchErr?.message);
      return res.status(400).json({ error: 'Unable to fetch the Threads post. Make sure the post is public.' });
    }

    // Check if verification code exists in the page content
    if (!agent.verificationCode || !pageContent.includes(agent.verificationCode)) {
      return res.status(400).json({
        error: `Verification code "${agent.verificationCode}" not found in the post. Make sure your post contains the exact code.`,
      });
    }

    // Create or update owner
    const owner = await prisma.owner.upsert({
      where: { threadsUserId: `threads_${threadsUsername}` },
      update: { threadsUsername },
      create: {
        email: `${threadsUsername}@threads.verified.local`,
        threadsUserId: `threads_${threadsUsername}`,
        threadsUsername,
      },
    });

    // Extract post ID from URL
    const postId = threadsUrlMatch ? threadsUrlMatch[4] : (threadsShortMatch ? threadsShortMatch[3] : 'unknown');

    // Save verification artifact
    const contentHash = crypto.createHash('sha256').update(pageContent).digest('hex');
    await prisma.verificationArtifact.upsert({
      where: { provider_postId: { provider: 'threads', postId } },
      update: {
        postUrl: post_url,
        contentHash,
        rawPayload: { threadsUsername, verificationCode: agent.verificationCode },
        verifiedAt: new Date(),
      },
      create: {
        agentId: agent.id,
        ownerId: owner.id,
        provider: 'threads',
        postId,
        postUrl: post_url,
        contentHash,
        rawPayload: { threadsUsername, verificationCode: agent.verificationCode },
      },
    });

    // Claim the agent
    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        status: 'threads_verified',
        ownerId: owner.id,
        claimedAt: new Date(),
        claimCode: null,
      },
    });

    return res.json({
      success: true,
      agent: agent.name,
      owner: `@${threadsUsername}`,
      message: `Agent "${agent.name}" verified via Threads post by @${threadsUsername}`,
    });
  } catch (err: any) {
    console.error('Threads post verification error:', err?.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/v1/verify/recheck
 * Periodic re-check: fetch all verification post URLs.
 * If post is deleted (404/unreachable) or verification code no longer present → revoke verified status.
 * 
 * Body: { secret?: string } (optional auth for cron)
 */
verifyRoutes.post('/recheck', async (req: Request, res: Response) => {
  try {
    // Simple secret check for cron calls
    const { secret } = req.body;
    const expectedSecret = process.env.RECHECK_SECRET || 'openclaw_recheck_2026';
    if (secret !== expectedSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all verification artifacts
    const artifacts = await prisma.verificationArtifact.findMany({
      include: {
        agent: { select: { id: true, name: true, status: true, verificationCode: true } },
      },
    });

    const results: { agent: string; status: string; reason?: string }[] = [];
    let revoked = 0;

    for (const artifact of artifacts) {
      // Skip agents that are already unverified
      if (!artifact.agent.status?.includes('verified')) {
        results.push({ agent: artifact.agent.name, status: 'skipped', reason: 'not currently verified' });
        continue;
      }

      try {
        const response = await axios.get(artifact.postUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; OpenClawBot/1.0)',
            Accept: 'text/html,application/xhtml+xml',
          },
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: (s) => s < 500, // don't throw on 4xx
        });

        const pageContent = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

        // Check if post is gone (404, empty, or redirect to login/home)
        const isGone = response.status === 404 || response.status === 410;
        const codeStillPresent = artifact.agent.verificationCode && pageContent.includes(artifact.agent.verificationCode);

        if (isGone || !codeStillPresent) {
          // Revoke verification
          await prisma.agent.update({
            where: { id: artifact.agentId },
            data: { status: 'unverified' },
          });
          revoked++;
          results.push({
            agent: artifact.agent.name,
            status: 'revoked',
            reason: isGone ? `HTTP ${response.status}` : 'verification code not found in post',
          });
        } else {
          results.push({ agent: artifact.agent.name, status: 'valid' });
        }
      } catch (fetchErr: any) {
        // Network error = post might be deleted
        await prisma.agent.update({
          where: { id: artifact.agentId },
          data: { status: 'unverified' },
        });
        revoked++;
        results.push({
          agent: artifact.agent.name,
          status: 'revoked',
          reason: `fetch error: ${fetchErr?.message}`,
        });
      }

      // Rate limit: wait 1s between checks to avoid hammering Threads
      await new Promise((r) => setTimeout(r, 1000));
    }

    return res.json({
      success: true,
      total: artifacts.length,
      revoked,
      results,
    });
  } catch (err: any) {
    console.error('Recheck error:', err?.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
