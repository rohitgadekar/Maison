-- EMERGENCY INVENTORY TRIGGER PURGE
-- This script removes all previous automation to fix the "deducting by 2" bug.
-- RUN THIS IN YOUR SUPABASE SQL EDITOR.

-- 1. Remove all possible triggers on orders and order_items
DROP TRIGGER IF EXISTS tr_on_order_item_created ON public.order_items;
DROP TRIGGER IF EXISTS tr_manage_inventory_on_order_status ON public.orders;

-- 2. Remove all possible trigger functions
DROP FUNCTION IF EXISTS public.fn_auto_deduct_inventory();
DROP FUNCTION IF EXISTS public.fn_manage_inventory_on_order_status();

-- 3. Redefine the CLEAN deduct_inventory function (No changes, just ensuring it's correct)
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

-- 4. Ensure permissions
GRANT EXECUTE ON FUNCTION public.deduct_inventory(JSONB) TO authenticated, anon, service_role;

-- 5. Logic check:
-- POD now calls this RPC once from Checkout.tsx manually.
-- Online now calls this RPC once from Webhook manually.
-- Result: Stock will be deducted EXACTLY once.
