-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL UNIQUE,
  kyc_status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create disclosure_groups table
CREATE TABLE IF NOT EXISTS disclosure_groups (
  id BIGSERIAL PRIMARY KEY,
  disclosure_group_code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create account_type_configs table
CREATE TABLE IF NOT EXISTS account_type_configs (
  account_type VARCHAR(30) PRIMARY KEY,
  term_months INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create account_id sequence
CREATE SEQUENCE IF NOT EXISTS account_id_seq START WITH 1 INCREMENT BY 1;

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  account_id VARCHAR(11) NOT NULL UNIQUE,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  status VARCHAR(20) NOT NULL,
  account_type VARCHAR(30) NOT NULL,
  credit_limit DECIMAL(15,2) NOT NULL CHECK (credit_limit > 0),
  cash_advance_limit DECIMAL(15,2) NOT NULL CHECK (cash_advance_limit > 0),
  opening_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  reissuance_date DATE,
  disclosure_group_id BIGINT NOT NULL REFERENCES disclosure_groups(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_cash_advance_limit CHECK (cash_advance_limit <= credit_limit)
);

-- Create account_balances table
CREATE TABLE IF NOT EXISTS account_balances (
  id BIGINT PRIMARY KEY REFERENCES accounts(id),
  account_id BIGINT NOT NULL REFERENCES accounts(id),
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  available_credit DECIMAL(15,2) NOT NULL,
  cash_advance_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  pending_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  last_interest_amount DECIMAL(15,2),
  last_interest_date DATE,
  version BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action VARCHAR(20) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100),
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  source VARCHAR(50),
  ip_address VARCHAR(45),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accounts_customer_id ON accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_expiration_date ON accounts(expiration_date);
CREATE INDEX IF NOT EXISTS idx_accounts_disclosure_group_id ON accounts(disclosure_group_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Insert sample data for testing
INSERT INTO customers (customer_id, kyc_status) VALUES
  ('CUS-2026-000123', 'VERIFIED'),
  ('CUS-2026-000124', 'PENDING'),
  ('CUS-2026-000125', 'VERIFIED')
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO disclosure_groups (disclosure_group_code, description) VALUES
  ('DG-STANDARD', 'Standard disclosure group for regular credit accounts'),
  ('DG-PREMIUM', 'Premium disclosure group for high-value accounts'),
  ('DG-PROMOTIONAL', 'Promotional disclosure group for special offers')
ON CONFLICT (disclosure_group_code) DO NOTHING;

INSERT INTO account_type_configs (account_type, term_months) VALUES
  ('STANDARD_CREDIT', 36),
  ('PREMIUM_CREDIT', 48),
  ('PROMOTIONAL_6MONTH', 6)
ON CONFLICT (account_type) DO NOTHING;
