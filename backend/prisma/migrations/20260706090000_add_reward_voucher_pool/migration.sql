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

CREATE UNIQUE INDEX IF NOT EXISTS "reward_vouchers_code_key"
  ON "reward_vouchers"("code");

CREATE UNIQUE INDEX IF NOT EXISTS "reward_vouchers_assigned_claim_id_key"
  ON "reward_vouchers"("assigned_claim_id");

CREATE INDEX IF NOT EXISTS "reward_vouchers_reward_type_status_idx"
  ON "reward_vouchers"("reward_type", "status");

CREATE INDEX IF NOT EXISTS "reward_vouchers_assigned_claim_id_idx"
  ON "reward_vouchers"("assigned_claim_id");
