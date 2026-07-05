import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { agentAuth } from '../middleware/auth';

export const newsletterRoutes = Router();

const DEFAULT_NOTIFY_AGENT_NAMES = ['yuriferry', 'Yuri', 'OpenClaw'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function notifyAgentNames() {
  const configured = (process.env.NEWSLETTER_NOTIFY_AGENT_NAME || '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

  return [...configured, ...DEFAULT_NOTIFY_AGENT_NAMES];
}

function normalizeEmail(value: unknown) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return null;
  return email;
}

function cleanText(value: unknown, max = 80) {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().replace(/\s+/g, ' ').slice(0, max);
  return cleaned || null;
}

async function findNotifyAgent() {
  for (const name of notifyAgentNames()) {
    const agent = await prisma.agent.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: { id: true, name: true },
    });
    if (agent) return agent;
  }

  return null;
}

async function canReadNewsletterInbox(agent: any) {
  const names = notifyAgentNames().map((name) => name.toLowerCase());
  if (names.includes(String(agent.name || '').toLowerCase())) return true;

  const assigned = await prisma.newsletterLead.count({
    where: { notificationAgentId: agent.id },
  });
  return assigned > 0;
}

function publicLeadPayload(lead: any) {
  const [name, domain] = String(lead.email).split('@');
  const masked = `${name.slice(0, 2)}***@${domain || 'email'}`;
  return {
    id: lead.id,
    email: masked,
    status: lead.status,
    created_at: lead.createdAt,
  };
}

newsletterRoutes.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const consent = req.body?.consent === true;

    if (!email) return res.status(400).json({ error: 'Valid email is required' });
    if (!consent) return res.status(400).json({ error: 'Consent is required before subscribing' });

    const notifyAgent = await findNotifyAgent();
    const source = cleanText(req.body?.source, 80) || 'website';
    const locale = cleanText(req.body?.locale, 20);
    const userAgent = cleanText(req.headers['user-agent'], 240);

    const lead = await prisma.newsletterLead.upsert({
      where: { email },
      update: {
        consent: true,
        source,
        locale,
        status: 'new',
        notificationAgentId: notifyAgent?.id || null,
        seenAt: null,
        userAgent,
      },
      create: {
        email,
        consent: true,
        source,
        locale,
        notificationAgentId: notifyAgent?.id || null,
        userAgent,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Subscribed. Yuri can see this from the newsletter inbox.',
      lead: publicLeadPayload(lead),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

newsletterRoutes.get('/check', agentAuth, async (req: Request, res: Response) => {
  if (!(await canReadNewsletterInbox(req.agent))) {
    return res.status(403).json({ error: 'This inbox is reserved for the configured OpenClaw notification agent' });
  }

  const unread = await prisma.newsletterLead.count({
    where: {
      OR: [{ notificationAgentId: req.agent.id }, { notificationAgentId: null }],
      seenAt: null,
    },
  });

  res.json({
    success: true,
    has_activity: unread > 0,
    summary: `${unread} new newsletter lead(s)`,
    unread,
  });
});

newsletterRoutes.get('/inbox', agentAuth, async (req: Request, res: Response) => {
  if (!(await canReadNewsletterInbox(req.agent))) {
    return res.status(403).json({ error: 'This inbox is reserved for the configured OpenClaw notification agent' });
  }

  const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
  const unreadOnly = req.query.unread === 'true';
  const leads = await prisma.newsletterLead.findMany({
    where: {
      OR: [{ notificationAgentId: req.agent.id }, { notificationAgentId: null }],
      ...(unreadOnly ? { seenAt: null } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  res.json({
    success: true,
    leads: leads.map((lead) => ({
      id: lead.id,
      email: lead.email,
      source: lead.source,
      locale: lead.locale,
      status: lead.status,
      seen_at: lead.seenAt,
      created_at: lead.createdAt,
    })),
  });
});

newsletterRoutes.post('/inbox/:id/seen', agentAuth, async (req: Request, res: Response) => {
  if (!(await canReadNewsletterInbox(req.agent))) {
    return res.status(403).json({ error: 'This inbox is reserved for the configured OpenClaw notification agent' });
  }

  const lead = await prisma.newsletterLead.findFirst({
    where: {
      id: req.params.id,
      OR: [{ notificationAgentId: req.agent.id }, { notificationAgentId: null }],
    },
  });

  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const updated = await prisma.newsletterLead.update({
    where: { id: lead.id },
    data: { seenAt: new Date(), status: 'seen' },
  });

  res.json({
    success: true,
    lead: {
      id: updated.id,
      email: updated.email,
      status: updated.status,
      seen_at: updated.seenAt,
    },
  });
});
