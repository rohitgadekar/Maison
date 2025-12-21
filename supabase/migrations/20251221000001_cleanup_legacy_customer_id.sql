-- Finalize migration by dropping the legacy individual designation column
-- Only run this after verifying that customer_ids array is correctly populated
ALTER TABLE coupons DROP COLUMN IF EXISTS customer_id;
