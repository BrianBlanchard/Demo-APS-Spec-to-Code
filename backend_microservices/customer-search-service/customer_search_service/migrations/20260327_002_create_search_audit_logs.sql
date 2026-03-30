-- Create search_audit_logs table
CREATE TABLE IF NOT EXISTS search_audit_logs (
  search_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  query TEXT NOT NULL,
  filters JSONB,
  result_count INTEGER NOT NULL,
  query_time_ms INTEGER NOT NULL,
  zero_results BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for audit analysis
CREATE INDEX idx_search_audit_logs_user_id ON search_audit_logs (user_id);
CREATE INDEX idx_search_audit_logs_created_at ON search_audit_logs (created_at DESC);
CREATE INDEX idx_search_audit_logs_zero_results ON search_audit_logs (zero_results) WHERE zero_results = TRUE;
CREATE INDEX idx_search_audit_logs_filters ON search_audit_logs USING gin (filters);
