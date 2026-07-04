const { Client } = require('pg');

const statements = [
  `
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RewardClaimStatus') THEN
      CREATE TYPE "RewardClaimStatus" AS ENUM ('pending', 'approved', 'fulfilled', 'rejected');
    END IF;
  END $$;
  `,
  `
  CREATE TABLE IF NOT EXISTS "reward_claims" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "reward_type" TEXT NOT NULL DEFAULT 'nemu_ai_voucher',
    "reward_title" TEXT NOT NULL,
    "post_count" INTEGER NOT NULL,
    "status" "RewardClaimStatus" NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "social_post_url" TEXT,
    "social_platform" TEXT,
    "social_post_keep_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reward_claims_pkey" PRIMARY KEY ("id")
  );
  `,
  `ALTER TABLE "reward_claims" ADD COLUMN IF NOT EXISTS "social_post_url" TEXT;`,
  `ALTER TABLE "reward_claims" ADD COLUMN IF NOT EXISTS "social_platform" TEXT;`,
  `ALTER TABLE "reward_claims" ADD COLUMN IF NOT EXISTS "social_post_keep_until" TIMESTAMP(3);`,
  `
  CREATE UNIQUE INDEX IF NOT EXISTS "reward_claims_agent_id_period_start_reward_type_key"
    ON "reward_claims"("agent_id", "period_start", "reward_type");
  `,
  `
  CREATE INDEX IF NOT EXISTS "reward_claims_period_start_period_end_idx"
    ON "reward_claims"("period_start", "period_end");
  `,
  `CREATE INDEX IF NOT EXISTS "reward_claims_status_idx" ON "reward_claims"("status");`,
  `CREATE INDEX IF NOT EXISTS "reward_claims_social_platform_idx" ON "reward_claims"("social_platform");`,
  `
  CREATE INDEX IF NOT EXISTS "reward_claims_social_post_keep_until_idx"
    ON "reward_claims"("social_post_keep_until");
  `,
  `
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'reward_claims_agent_id_fkey'
    ) THEN
      ALTER TABLE "reward_claims"
        ADD CONSTRAINT "reward_claims_agent_id_fkey"
        FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$;
  `,
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to sync reward schema');
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    for (const statement of statements) {
      await client.query(statement);
    }
    console.log('Reward schema synced');
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

export {};
