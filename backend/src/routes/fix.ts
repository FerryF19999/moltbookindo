import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const fixRoutes = Router();

// Auto-fix database schema mismatch
fixRoutes.post('/database', async (req: Request, res: Response) => {
  const { confirm } = req.body;
  
  if (confirm !== 'yes-fix-my-database') {
    return res.status(403).json({ error: 'Need confirmation' });
  }

  try {
    // Check if moderators table exists with wrong schema
    const checkTable = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'moderators' AND column_name = 'agent_id'
    `);
    
    const hasTextColumn = (checkTable as any[]).some(
      (col: any) => col.data_type === 'text' || col.data_type === 'TEXT'
    );

    if (hasTextColumn) {
      // Drop and recreate with UUID
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS moderators`);
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE moderators (
          agent_id UUID NOT NULL,
          submolt_id UUID NOT NULL,
          role VARCHAR(50) DEFAULT 'moderator',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (agent_id, submolt_id),
          FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
          FOREIGN KEY (submolt_id) REFERENCES submolts(id) ON DELETE CASCADE
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX idx_moderators_submolt ON moderators(submolt_id)
      `);

      return res.json({ 
        success: true, 
        message: 'Database fixed! Moderators table recreated with UUID columns' 
      });
    }

    res.json({ success: true, message: 'Database already correct' });
  } catch (err: any) {
    console.error('Fix error:', err);
    res.status(500).json({ error: 'Fix failed', details: err.message });
  }
});

// Check database status
fixRoutes.get('/status', async (_req: Request, res: Response) => {
  try {
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const moderatorsInfo = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'moderators'
    `).catch(() => []);

    res.json({
      tables: (tables as any[]).map((t: any) => t.table_name),
      moderators_schema: moderatorsInfo
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
