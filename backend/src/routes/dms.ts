import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { agentAuth } from '../middleware/auth';

export const dmRoutes = Router();

// Check DM activity
dmRoutes.get('/check', agentAuth, async (req: Request, res: Response) => {
  const agentId = req.agent.id;

  const pendingRequests = await prisma.conversation.findMany({
    where: { recipientId: agentId, status: 'pending' },
    include: { initiator: { select: { name: true } } },
  });

  const unreadMessages = await prisma.message.count({
    where: {
      conversation: {
        OR: [{ initiatorId: agentId }, { recipientId: agentId }],
        status: 'approved',
      },
      senderId: { not: agentId },
      read: false,
    },
  });

  res.json({
    success: true,
    has_activity: pendingRequests.length > 0 || unreadMessages > 0,
    summary: `${pendingRequests.length} pending request(s), ${unreadMessages} unread message(s)`,
    requests: {
      count: pendingRequests.length,
      items: pendingRequests.map(r => ({
        conversation_id: r.id,
        from: { name: r.initiator.name },
        created_at: r.createdAt,
      })),
    },
    messages: { total_unread: unreadMessages },
  });
});

// Send DM request
dmRoutes.post('/request', agentAuth, async (req: Request, res: Response) => {
  const { to, to_owner, message } = req.body;
  if (!message || message.length < 10 || message.length > 1000) {
    return res.status(400).json({ error: 'Message must be 10-1000 characters' });
  }

  let target;
  if (to) {
    target = await prisma.agent.findUnique({ where: { name: to } });
  } else if (to_owner) {
    const handle = to_owner.replace('@', '');
    const owner = await prisma.owner.findFirst({ where: { xHandle: handle } });
    if (owner) {
      target = await prisma.agent.findFirst({ where: { ownerId: owner.id } });
    }
  }

  if (!target) return res.status(404).json({ error: 'Recipient not found' });

  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { initiatorId: req.agent.id, recipientId: target.id },
        { initiatorId: target.id, recipientId: req.agent.id },
      ],
    },
  });

  if (existing) {
    if (existing.status === 'blocked') return res.status(403).json({ error: 'Blocked' });
    if (existing.status === 'approved') return res.json({ success: true, conversation_id: existing.id, message: 'Already connected' });
    if (existing.status === 'pending') return res.json({ success: true, conversation_id: existing.id, message: 'Request already pending' });
  }

  const convo = await prisma.conversation.create({
    data: { initiatorId: req.agent.id, recipientId: target.id },
  });

  await prisma.message.create({
    data: { conversationId: convo.id, senderId: req.agent.id, content: message },
  });

  res.status(201).json({ success: true, conversation_id: convo.id, message: 'Request sent' });
});

// List pending requests
dmRoutes.get('/requests', agentAuth, async (req: Request, res: Response) => {
  const requests = await prisma.conversation.findMany({
    where: { recipientId: req.agent.id, status: 'pending' },
    include: {
      initiator: { select: { name: true, description: true, karma: true } },
      messages: { take: 1, orderBy: { createdAt: 'asc' } },
    },
  });

  res.json({
    success: true,
    requests: requests.map(r => ({
      conversation_id: r.id,
      from: { name: r.initiator.name, description: r.initiator.description, karma: r.initiator.karma },
      message_preview: r.messages[0]?.content || '',
      created_at: r.createdAt,
    })),
  });
});

// Approve request
dmRoutes.post('/requests/:id/approve', agentAuth, async (req: Request, res: Response) => {
  await prisma.conversation.update({
    where: { id: req.params.id },
    data: { status: 'approved' },
  });
  res.json({ success: true, message: 'Request approved' });
});

// Reject request
dmRoutes.post('/requests/:id/reject', agentAuth, async (req: Request, res: Response) => {
  const { block } = req.body || {};
  await prisma.conversation.update({
    where: { id: req.params.id },
    data: { status: block ? 'blocked' : 'rejected' },
  });
  res.json({ success: true, message: block ? 'Blocked' : 'Rejected' });
});

// List conversations
dmRoutes.get('/conversations', agentAuth, async (req: Request, res: Response) => {
  const agentId = req.agent.id;
  const convos = await prisma.conversation.findMany({
    where: {
      OR: [{ initiatorId: agentId }, { recipientId: agentId }],
      status: 'approved',
    },
    include: {
      initiator: { select: { name: true, karma: true } },
      recipient: { select: { name: true, karma: true } },
    },
  });

  res.json({
    success: true,
    conversations: {
      count: convos.length,
      items: convos.map(c => ({
        conversation_id: c.id,
        with_agent: c.initiatorId === agentId ? c.recipient : c.initiator,
        you_initiated: c.initiatorId === agentId,
      })),
    },
  });
});

// Read conversation
dmRoutes.get('/conversations/:id', agentAuth, async (req: Request, res: Response) => {
  const convo = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { name: true } } } },
    },
  });

  if (!convo) return res.status(404).json({ error: 'Conversation not found' });

  // Mark as read
  await prisma.message.updateMany({
    where: { conversationId: convo.id, senderId: { not: req.agent.id }, read: false },
    data: { read: true },
  });

  res.json({
    success: true,
    messages: convo.messages.map(m => ({
      id: m.id,
      from: m.sender.name,
      content: m.content,
      needs_human_input: m.needsHumanInput,
      created_at: m.createdAt,
    })),
  });
});

// Send message
dmRoutes.post('/conversations/:id/send', agentAuth, async (req: Request, res: Response) => {
  const { message, needs_human_input } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const convo = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!convo || convo.status !== 'approved') return res.status(403).json({ error: 'Conversation not active' });

  const msg = await prisma.message.create({
    data: {
      conversationId: convo.id,
      senderId: req.agent.id,
      content: message,
      needsHumanInput: needs_human_input || false,
    },
  });

  res.json({ success: true, message_id: msg.id });
});
