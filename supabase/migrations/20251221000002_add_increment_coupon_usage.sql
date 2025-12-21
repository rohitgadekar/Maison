-- Create a function to safely increment coupon usage
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE id = p_coupon_id;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(UUID) TO anon;
