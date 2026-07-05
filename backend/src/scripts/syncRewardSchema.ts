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
    "voucher_code" TEXT,
    "voucher_title" TEXT,
    "voucher_description" TEXT,
    "voucher_redeem_url" TEXT,
    "fulfilled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reward_claims_pkey" PRIMARY KEY ("id")
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS "reward_vouchers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "reward_type" TEXT NOT NULL DEFAULT 'nemu_ai_voucher',
    "title" TEXT,
    "description" TEXT,
    "redeem_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "assigned_claim_id" TEXT,
    "assigned_at" TIMESTAMP(3),
    "redeemed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reward_vouchers_pkey" PRIMARY KEY ("id")
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS "newsletter_leads" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "locale" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notification_agent_id" TEXT,
    "seen_at" TIMESTAMP(3),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "newsletter_leads_pkey" PRIMARY KEY ("id")
  );
  `,
  `ALTER TABLE "reward_claims" ADD COLUMN IF NOT EXISTS "social_post_url" TEXT;`,
  `ALTER TABLE "reward_claims" ADD COLUMN IF NOT EXISTS "social_platform" TEXT;`,
  `ALTER TABLE "reward_claims" ADD COLUMN IF NOT EXISTS "social_post_keep_until" TIMESTAMP(3);`,
  `ALTER TABLE "reward_claims" ADD COLUMN IF NOT EXISTS "voucher_code" TEXT;`,
  `ALTER TABLE "reward_claims" ADD COLUMN IF NOT EXISTS "voucher_title" TEXT;`,
  `ALTER TABLE "reward_claims" ADD COLUMN IF NOT EXISTS "voucher_description" TEXT;`,
  `ALTER TABLE "reward_claims" ADD COLUMN IF NOT EXISTS "voucher_redeem_url" TEXT;`,
  `ALTER TABLE "reward_claims" ADD COLUMN IF NOT EXISTS "fulfilled_at" TIMESTAMP(3);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "reward_claims_voucher_code_key" ON "reward_claims"("voucher_code");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "reward_vouchers_code_key" ON "reward_vouchers"("code");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "reward_vouchers_assigned_claim_id_key" ON "reward_vouchers"("assigned_claim_id");`,
  `CREATE INDEX IF NOT EXISTS "reward_vouchers_reward_type_status_idx" ON "reward_vouchers"("reward_type", "status");`,
  `CREATE INDEX IF NOT EXISTS "reward_vouchers_assigned_claim_id_idx" ON "reward_vouchers"("assigned_claim_id");`,
  `ALTER TABLE "newsletter_leads" ADD COLUMN IF NOT EXISTS "consent" BOOLEAN NOT NULL DEFAULT false;`,
  `ALTER TABLE "newsletter_leads" ADD COLUMN IF NOT EXISTS "source" TEXT;`,
  `ALTER TABLE "newsletter_leads" ADD COLUMN IF NOT EXISTS "locale" TEXT;`,
  `ALTER TABLE "newsletter_leads" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'new';`,
  `ALTER TABLE "newsletter_leads" ADD COLUMN IF NOT EXISTS "notification_agent_id" TEXT;`,
  `ALTER TABLE "newsletter_leads" ADD COLUMN IF NOT EXISTS "seen_at" TIMESTAMP(3);`,
  `ALTER TABLE "newsletter_leads" ADD COLUMN IF NOT EXISTS "user_agent" TEXT;`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_leads_email_key" ON "newsletter_leads"("email");`,
  `CREATE INDEX IF NOT EXISTS "newsletter_leads_notification_agent_id_seen_at_idx" ON "newsletter_leads"("notification_agent_id", "seen_at");`,
  `CREATE INDEX IF NOT EXISTS "newsletter_leads_created_at_idx" ON "newsletter_leads"("created_at");`,
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
