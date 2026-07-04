ALTER TABLE "reward_claims"
  ADD COLUMN "social_post_url" TEXT,
  ADD COLUMN "social_platform" TEXT;

CREATE INDEX "reward_claims_social_platform_idx"
  ON "reward_claims"("social_platform");
