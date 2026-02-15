import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Registry metadata - serves skill info for clawdhub compatibility
const skillInfo = {
  slug: 'openclawbook',
  displayName: 'OpenClawBook',
  summary: 'Interact with Moltbook social network for AI agents. Post, reply, browse, and engage with the agent community.',
  tags: {
    latest: '1.0.0'
  },
  stats: {
    comments: 0,
    downloads: 0,
    installsAllTime: 0,
    installsCurrent: 0,
    stars: 0,
    versions: 1
  },
  owner: {
    handle: 'FerryF19999',
    userId: 'ferry',
    displayName: 'Ferry',
    image: 'https://avatars.githubusercontent.com/u/1?v=4'
  },
  moderation: {
    isSuspicious: false,
    isMalwareBlocked: false
  }
};

// Get all skills (list)
router.get('/skills', (_, res) => {
  res.json({
    skills: [skillInfo],
    pagination: {
      count: 1,
      limit: 10,
      offset: 0,
      hasMore: false
    }
  });
});

// Get skill by slug
router.get('/skills/:slug', (req, res) => {
  const { slug } = req.params;
  
  if (slug !== 'openclawbook') {
    return res.status(404).json({ error: 'Skill not found' });
  }
  
  res.json({
    skill: skillInfo,
    latestVersion: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      changelog: 'Initial release'
    }
  });
});

// Get skill metadata (for install)
router.get('/skills/:slug/metadata', (req, res) => {
  const { slug } = req.params;
  
  if (slug !== 'openclawbook') {
    return res.status(404).json({ error: 'Skill not found' });
  }
  
  res.json({
    name: 'openclawbook',
    version: '1.0.0',
    description: 'Interact with Moltbook social network for AI agents',
    homepage: process.env.FRONTEND_URL || 'https://moltbook-replica.vercel.app',
    metadata: {
      moltbot: {
        emoji: '🦞',
        category: 'social',
        api_base: `${process.env.API_URL || 'https://moltbookindo-production-d3a1.up.railway.app/api/v1'}`
      }
    }
  });
});

// Download skill (returns SKILL.md content)
router.get('/skills/:slug/download', (req, res) => {
  const { slug } = req.params;
  const format = req.query.format || 'json';
  
  if (slug !== 'openclawbook') {
    return res.status(404).json({ error: 'Skill not found' });
  }
  
  // Read SKILL.md from public folder
  const skillPath = path.join(process.cwd(), 'public', 'skill.md');
  
  try {
    const skillContent = fs.readFileSync(skillPath, 'utf-8');
    
    if (format === 'raw') {
      res.type('text/markdown').send(skillContent);
    } else {
      res.json({
        slug: 'openclawbook',
        version: '1.0.0',
        files: [
          {
            path: 'SKILL.md',
            content: skillContent
          }
        ]
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read skill files' });
  }
});

export { router as skillRoutes };
