-- LLM usage tracking table for OpenAI middleware events.
CREATE TABLE IF NOT EXISTS token_usage (
  id BIGSERIAL PRIMARY KEY,
  request_id TEXT,
  user_id TEXT,
  endpoint TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL CHECK (output_tokens >= 0),
  total_tokens INTEGER NOT NULL CHECK (total_tokens >= 0),
  latency_ms INTEGER NOT NULL CHECK (latency_ms >= 0),
  cost_eur NUMERIC(14, 8) NOT NULL CHECK (cost_eur >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_model ON token_usage (model);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage (user_id);
