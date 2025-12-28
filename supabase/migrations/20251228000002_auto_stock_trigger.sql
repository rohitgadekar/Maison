-- AUTOMATIC INVENTORY DEDUCTION TRIGGER
-- This migration sets up a database trigger to ensure stock is ALWAYS deducted 
-- when a new order item is created, regardless of if it's Online or POD.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.fn_auto_deduct_inventory()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- A. Deduct from size-specific stock if size is provided
  IF NEW.size IS NOT NULL AND NEW.size != '' AND NEW.size != 'N/A' THEN
    UPDATE public.product_stocks
    SET quantity = GREATEST(0, quantity - NEW.quantity)
    WHERE product_id = NEW.product_id 
      AND size = NEW.size;
  END IF;

  -- B. Deduct from total product inventory
  UPDATE public.products
  SET inventory = GREATEST(0, inventory - NEW.quantity)
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

-- 2. Create the trigger on order_items table
-- First drop if exists to ensure clean state
DROP TRIGGER IF EXISTS tr_on_order_item_created ON public.order_items;

CREATE TRIGGER tr_on_order_item_created
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_deduct_inventory();

-- 3. (Optional but recommended) Cleanup old manual RPC
DROP FUNCTION IF EXISTS public.deduct_inventory(JSONB);
