-- CLEAN AND EXPLICIT INVENTORY MANAGEMENT RPCS
-- These functions provide a reliable way to manage stock from the application.

-- 1. DEDUCTION RPC
CREATE OR REPLACE FUNCTION public.deduct_inventory(p_items JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- A. Deduct from size-specific stock
    IF (v_item->>'size') IS NOT NULL AND (v_item->>'size') != '' AND (v_item->>'size') != 'N/A' THEN
      UPDATE public.product_stocks
      SET quantity = GREATEST(0, quantity - (v_item->>'quantity')::INTEGER)
      WHERE product_id = (v_item->>'product_id')::UUID 
        AND size = (v_item->>'size');
    END IF;

    -- B. Deduct from total product inventory
    UPDATE public.products
    SET inventory = GREATEST(0, inventory - (v_item->>'quantity')::INTEGER)
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;
END;
$$;

-- 2. RESTORATION RPC
-- Note: It uses the order_id to find items and restore them
CREATE OR REPLACE FUNCTION public.restore_inventory(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
  LOOP
    -- A. Restore size-specific stock
    IF v_item.size IS NOT NULL AND v_item.size != '' AND v_item.size != 'N/A' THEN
      UPDATE public.product_stocks
      SET quantity = quantity + v_item.quantity
      WHERE product_id = v_item.product_id 
        AND size = v_item.size;
    END IF;

    -- B. Restore total product inventory
    UPDATE public.products
    SET inventory = inventory + v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.deduct_inventory(JSONB) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.restore_inventory(UUID) TO authenticated, anon, service_role;
