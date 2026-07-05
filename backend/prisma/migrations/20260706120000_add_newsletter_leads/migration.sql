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

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_leads_email_key" ON "newsletter_leads"("email");
CREATE INDEX IF NOT EXISTS "newsletter_leads_notification_agent_id_seen_at_idx" ON "newsletter_leads"("notification_agent_id", "seen_at");
CREATE INDEX IF NOT EXISTS "newsletter_leads_created_at_idx" ON "newsletter_leads"("created_at");
