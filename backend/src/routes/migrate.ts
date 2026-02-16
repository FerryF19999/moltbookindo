import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const migrateRoutes = Router();

// DANGER: Only for initial setup
migrateRoutes.post('/run', async (req: Request, res: Response) => {
  const { secret } = req.body;
  
  // Simple secret check
  if (secret !== 'moltbook-migrate-2024') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // Run raw SQL migration
    await prisma.$executeRawUnsafe(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE submolts ADD COLUMN IF NOT EXISTS allow_crypto BOOLEAN DEFAULT false;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE submolts ADD COLUMN IF NOT EXISTS banner_color VARCHAR(7);
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE submolts ADD COLUMN IF NOT EXISTS theme_color VARCHAR(7);
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE submolts ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE submolts ADD COLUMN IF NOT EXISTS banner_url TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS moderators (
        agent_id UUID NOT NULL,
        submolt_id UUID NOT NULL,
        role VARCHAR(50) DEFAULT 'moderator',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (agent_id, submolt_id),
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
        FOREIGN KEY (submolt_id) REFERENCES submolts(id) ON DELETE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(is_pinned) WHERE is_pinned = true;
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_moderators_submolt ON moderators(submolt_id);
    `);

    res.json({ success: true, message: 'Migration completed!' });
  } catch (err: any) {
    console.error('Migration error:', err);
    res.status(500).json({ error: 'Migration failed', details: err.message });
  }
});
