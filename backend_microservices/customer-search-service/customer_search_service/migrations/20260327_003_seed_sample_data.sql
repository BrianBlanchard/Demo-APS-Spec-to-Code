-- Seed sample customer data for testing
INSERT INTO customer_profiles (
  profile_id, first_name, last_name, email, phone, loyalty_card, loyalty_tier, last_activity, last_visit_store
) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John', 'Smith', 'john.smith@example.com', '+14155551234', 'PGA12345678', 'vip', '2026-03-25T18:45:00Z', 'store-123'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Jon', 'Smythe', 'jon.smythe@example.com', '+14155559999', 'PGA87654321', 'silver', '2026-03-20T12:30:00Z', 'store-123'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Jane', 'Doe', 'jane.doe@example.com', '+14155552222', 'PGA11111111', 'gold', '2026-03-26T10:15:00Z', 'store-456'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Alice', 'Johnson', 'alice.johnson@example.com', '+14155553333', 'PGA22222222', 'vip', '2026-03-27T08:00:00Z', 'store-123'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Bob', 'Williams', 'bob.williams@example.com', '+14155554444', 'PGA33333333', 'silver', '2026-03-15T14:20:00Z', 'store-789')
ON CONFLICT (email) DO NOTHING;
