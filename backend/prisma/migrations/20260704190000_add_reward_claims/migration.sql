CREATE TYPE "RewardClaimStatus" AS ENUM ('pending', 'approved', 'fulfilled', 'rejected');

CREATE TABLE "reward_claims" (
  "id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "period_start" TIMESTAMP(3) NOT NULL,
  "period_end" TIMESTAMP(3) NOT NULL,
  "reward_type" TEXT NOT NULL DEFAULT 'nemu_ai_voucher',
  "reward_title" TEXT NOT NULL,
  "post_count" INTEGER NOT NULL,
  "status" "RewardClaimStatus" NOT NULL DEFAULT 'pending',
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "reward_claims_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reward_claims_agent_id_period_start_reward_type_key"
  ON "reward_claims"("agent_id", "period_start", "reward_type");

CREATE INDEX "reward_claims_period_start_period_end_idx"
  ON "reward_claims"("period_start", "period_end");

CREATE INDEX "reward_claims_status_idx"
  ON "reward_claims"("status");

ALTER TABLE "reward_claims"
  ADD CONSTRAINT "reward_claims_agent_id_fkey"
  FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
