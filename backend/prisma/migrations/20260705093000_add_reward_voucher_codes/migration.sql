ALTER TABLE "reward_claims"
  ADD COLUMN IF NOT EXISTS "voucher_code" TEXT,
  ADD COLUMN IF NOT EXISTS "voucher_title" TEXT,
  ADD COLUMN IF NOT EXISTS "voucher_description" TEXT,
  ADD COLUMN IF NOT EXISTS "voucher_redeem_url" TEXT,
  ADD COLUMN IF NOT EXISTS "fulfilled_at" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "reward_claims_voucher_code_key"
  ON "reward_claims"("voucher_code");
