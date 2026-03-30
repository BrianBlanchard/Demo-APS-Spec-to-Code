-- Create accounts table (for testing and reference)
CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  account_id VARCHAR(11) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on account_id
CREATE INDEX idx_accounts_account_id ON accounts(account_id);

-- Create index on status
CREATE INDEX idx_accounts_status ON accounts(status);

-- Insert sample accounts for testing
INSERT INTO accounts (account_id, status) VALUES
  ('12345678901', 'Active'),
  ('12345678902', 'Suspended'),
  ('12345678903', 'Closed'),
  ('12345678904', 'New')
ON CONFLICT (account_id) DO NOTHING;
