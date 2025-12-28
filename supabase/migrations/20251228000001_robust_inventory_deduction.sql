-- Comprehensive inventory deduction function
-- This function correctly subtracts stock and handles both size-specific and total inventory.
-- It is designed to be called via Supabase RPC.

CREATE OR REPLACE FUNCTION public.deduct_inventory(p_items JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  v_product_id UUID;
  v_quantity INTEGER;
  v_size TEXT;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (item->>'product_id')::UUID;
    v_quantity := (item->>'quantity')::INTEGER;
    v_size := item->>'size';

    -- 1. Update size-specific stock if size is provided
    IF v_size IS NOT NULL AND v_size != '' AND v_size != 'N/A' THEN
      UPDATE public.product_stocks
      SET quantity = GREATEST(0, quantity - v_quantity)
      WHERE product_id = v_product_id 
        AND size = v_size;
        
      -- Log if no row was updated for debugging (optional)
    END IF;

    -- 2. Update total product inventory
    UPDATE public.products
    SET inventory = GREATEST(0, inventory - v_quantity)
    WHERE id = v_product_id;
  END LOOP;
END;
$$;

-- Grant execution permissions to ensure it can be called from the frontend
GRANT EXECUTE ON FUNCTION public.deduct_inventory(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_inventory(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.deduct_inventory(JSONB) TO service_role;
