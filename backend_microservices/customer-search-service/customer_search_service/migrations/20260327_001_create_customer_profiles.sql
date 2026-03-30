-- Create customer_profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  loyalty_card VARCHAR(50) UNIQUE,
  loyalty_tier VARCHAR(20) NOT NULL CHECK (loyalty_tier IN ('vip', 'gold', 'silver')),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_visit_store VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for search optimization
CREATE INDEX idx_customer_profiles_first_name ON customer_profiles USING gin (first_name gin_trgm_ops);
CREATE INDEX idx_customer_profiles_last_name ON customer_profiles USING gin (last_name gin_trgm_ops);
CREATE INDEX idx_customer_profiles_email ON customer_profiles (email);
CREATE INDEX idx_customer_profiles_phone ON customer_profiles (phone);
CREATE INDEX idx_customer_profiles_loyalty_card ON customer_profiles (loyalty_card);
CREATE INDEX idx_customer_profiles_loyalty_tier ON customer_profiles (loyalty_tier);
CREATE INDEX idx_customer_profiles_last_activity ON customer_profiles (last_activity DESC);

-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
