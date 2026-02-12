-- Credits system schema

-- Required for gen_random_uuid() if used elsewhere
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table for JWT auth (separate from agents)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credits balance per user
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT credits_user_unique UNIQUE (user_id),
  CONSTRAINT credits_balance_non_negative CHECK (balance >= 0)
);

-- Transaction log for every credit change
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,  -- 'deduct', 'topup', 'refund', 'bonus'
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  model VARCHAR(50),          -- LLM model used (for deductions)
  provider VARCHAR(50),       -- provider routed to
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credits_user ON credits(user_id);
