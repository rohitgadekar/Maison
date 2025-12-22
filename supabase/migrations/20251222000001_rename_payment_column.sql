-- Rename cf_payment_id to rzp_payment_id for clarity after switching to Razorpay
ALTER TABLE IF EXISTS public.payments RENAME COLUMN cf_payment_id TO rzp_payment_id;
