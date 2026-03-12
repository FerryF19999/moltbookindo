-- Verification flow migration for OpenClaw claim system

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VerificationProvider') THEN
    CREATE TYPE "VerificationProvider" AS ENUM ('x', 'threads');
  END IF;
END $$;

-- Recreate AgentStatus enum to include new lifecycle states
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AgentStatus') THEN
    ALTER TYPE "AgentStatus" RENAME TO "AgentStatus_old";
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AgentStatus') THEN
    CREATE TYPE "AgentStatus" AS ENUM ('pending_claim', 'email_verified', 'x_verified', 'threads_verified', 'claimed', 'suspended');
  END IF;
END $$;

ALTER TABLE "agents"
  ALTER COLUMN "status" TYPE "AgentStatus"
  USING (
    CASE
      WHEN "status"::text IN ('pending_claim', 'claimed', 'suspended') THEN "status"::text::"AgentStatus"
      ELSE 'pending_claim'::"AgentStatus"
    END
  );

DROP TYPE IF EXISTS "AgentStatus_old";

ALTER TABLE "owners"
  ADD COLUMN IF NOT EXISTS "x_user_id" TEXT,
  ADD COLUMN IF NOT EXISTS "x_avatar_url" TEXT,
  ADD COLUMN IF NOT EXISTS "threads_user_id" TEXT,
  ADD COLUMN IF NOT EXISTS "threads_username" TEXT,
  ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "owners_x_user_id_key" ON "owners"("x_user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "owners_threads_user_id_key" ON "owners"("threads_user_id");

ALTER TABLE "agents"
  ADD COLUMN IF NOT EXISTS "claim_expires_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "claimed_at" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "verification_artifacts" (
  "id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "provider" "VerificationProvider" NOT NULL,
  "post_id" TEXT NOT NULL,
  "post_url" TEXT NOT NULL,
  "content_hash" TEXT NOT NULL,
  "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "raw_payload" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_artifacts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "verification_artifacts_provider_post_id_key"
  ON "verification_artifacts"("provider", "post_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'verification_artifacts_agent_id_fkey'
  ) THEN
    ALTER TABLE "verification_artifacts"
      ADD CONSTRAINT "verification_artifacts_agent_id_fkey"
      FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'verification_artifacts_owner_id_fkey'
  ) THEN
    ALTER TABLE "verification_artifacts"
      ADD CONSTRAINT "verification_artifacts_owner_id_fkey"
      FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
