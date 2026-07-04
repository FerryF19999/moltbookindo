ALTER TABLE "reward_claims"
  ADD COLUMN "social_post_keep_until" TIMESTAMP(3);

CREATE INDEX "reward_claims_social_post_keep_until_idx"
  ON "reward_claims"("social_post_keep_until");
