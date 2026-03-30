-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id BIGSERIAL PRIMARY KEY,
  card_number VARCHAR(255) NOT NULL,  -- AES-256 encrypted PAN
  last_four_digits CHAR(4) NOT NULL,   -- Unencrypted last 4 for search
  account_id VARCHAR(11) NOT NULL,     -- FK to accounts
  status VARCHAR(20) NOT NULL,         -- Card status
  expiration_date DATE NOT NULL,       -- Expiration date
  embossed_name VARCHAR(100),          -- Name on card (optional)
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_cards_account FOREIGN KEY (account_id)
    REFERENCES accounts(account_id) ON DELETE RESTRICT
);

-- Create indexes for performance
CREATE INDEX idx_cards_account_id ON cards(account_id);
CREATE INDEX idx_cards_last_four_digits ON cards(last_four_digits);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_cards_expiration_date ON cards(expiration_date);

-- Create unique index on encrypted card_number to prevent duplicates
CREATE UNIQUE INDEX idx_cards_card_number ON cards(card_number);

-- Add comments for documentation
COMMENT ON TABLE cards IS 'Stores payment card information with PCI-DSS compliant encryption';
COMMENT ON COLUMN cards.card_number IS 'AES-256 encrypted 16-digit PAN';
COMMENT ON COLUMN cards.last_four_digits IS 'Unencrypted last 4 digits for search and display';
