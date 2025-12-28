-- Fix the deduct_inventory function to correctly subtract stock
-- and handle both product_stocks (size-specific) and products (total) tables.

CREATE OR REPLACE FUNCTION public.deduct_inventory(p_items JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- 1. Update size-specific stock if size is provided and valid
    IF (item->>'size') IS NOT NULL AND (item->>'size') != 'N/A' AND (item->>'size') != '' THEN
      UPDATE public.product_stocks
      SET quantity = GREATEST(0, quantity - (item->>'quantity')::INTEGER)
      WHERE product_id = (item->>'product_id')::UUID 
        AND size = (item->>'size');
    END IF;

    -- 2. Update total product inventory
    UPDATE public.products
    SET inventory = GREATEST(0, inventory - (item->>'quantity')::INTEGER)
    WHERE id = (item->>'product_id')::UUID;
  END LOOP;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.deduct_inventory(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_inventory(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.deduct_inventory(JSONB) TO service_role;
