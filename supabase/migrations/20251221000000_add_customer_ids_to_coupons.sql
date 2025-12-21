ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS customer_ids UUID[] DEFAULT '{}';

-- Migration logic: Move existing customer_id to customer_ids array
UPDATE coupons 
SET customer_ids = ARRAY[customer_id] 
WHERE customer_id IS NOT NULL AND (customer_ids IS NULL OR cardinality(customer_ids) = 0);
