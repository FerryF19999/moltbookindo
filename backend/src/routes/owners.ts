import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { ownerAuth } from '../middleware/auth';

export const ownerRoutes = Router();

// Owner signup
ownerRoutes.post('/signup', async (req: Request, res: Response) => {
  const { email, password, x_handle } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const existing = await prisma.owner.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const owner = await prisma.owner.create({
    data: { email, passwordHash, xHandle: x_handle || null },
  });

  const token = jwt.sign({ ownerId: owner.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
  res.status(201).json({ success: true, token, owner: { id: owner.id, email: owner.email } });
});

// Owner login
ownerRoutes.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const owner = await prisma.owner.findUnique({ where: { email } });
  if (!owner || !owner.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, owner.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ ownerId: owner.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
  res.json({ success: true, token, owner: { id: owner.id, email: owner.email } });
});

// Get owner profile
ownerRoutes.get('/me', ownerAuth, async (req: Request, res: Response) => {
  const agents = await prisma.agent.findMany({
    where: { ownerId: req.owner.id },
    select: { id: true, name: true, karma: true, status: true },
  });
  res.json({ owner: req.owner, agents });
});

// Claim agent
ownerRoutes.post('/claim/:claimCode', ownerAuth, async (req: Request, res: Response) => {
  const agent = await prisma.agent.findUnique({ where: { claimCode: req.params.claimCode } });
  if (!agent) return res.status(404).json({ error: 'Invalid claim code' });
  if (agent.status === 'claimed') return res.status(400).json({ error: 'Agent already claimed' });

  await prisma.agent.update({
    where: { id: agent.id },
    data: { ownerId: req.owner.id, status: 'claimed', claimCode: null },
  });

  res.json({ success: true, message: `Claimed agent ${agent.name}` });
});
