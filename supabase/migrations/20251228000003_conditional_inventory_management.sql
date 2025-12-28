-- INVENTORY DEDUCTION CONTROL SYSTEM
-- This migration ensures stock is deducted ONLY when appropriate:
-- 1. For POD: Immediately upon order creation ('pending' status).
-- 2. For Online: Once payment is successful ('processing' status).
-- 3. Restoration: Whenever an order is 'cancelled'.

-- A. Add control column to orders table to prevent double-deduction
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS inventory_deducted BOOLEAN DEFAULT false;

-- B. Create the unified inventory management function
CREATE OR REPLACE FUNCTION public.fn_manage_inventory_on_order_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- 1. DEDUCTION LOGIC
  -- Condition for POD: Status is pending AND it is a POD order AND not already deducted
  -- Condition for Online: Status is processing AND it is any order AND not already deducted
  IF (NEW.status = 'pending' AND (NEW.shipping_method_name LIKE '%POD%' OR NEW.shipping_method_name LIKE '%Delivery%') AND NEW.inventory_deducted = false)
     OR (NEW.status = 'processing' AND NEW.inventory_deducted = false) THEN
    
    FOR v_item IN SELECT * FROM public.order_items WHERE order_id = NEW.id
    LOOP
      -- Subtract from size-specific stock
      IF v_item.size IS NOT NULL AND v_item.size != '' AND v_item.size != 'N/A' THEN
        UPDATE public.product_stocks
        SET quantity = GREATEST(0, quantity - v_item.quantity)
        WHERE product_id = v_item.product_id 
          AND size = v_item.size;
      END IF;

      -- Subtract from total product inventory
      UPDATE public.products
      SET inventory = GREATEST(0, inventory - v_item.quantity)
      WHERE id = v_item.product_id;
    END LOOP;

    NEW.inventory_deducted := true;
  
  -- 2. RESTORATION LOGIC
  -- If order is cancelled AND it was previously deducted, restore the stock
  ELSIF (NEW.status = 'cancelled' AND NEW.inventory_deducted = true) THEN
    
    FOR v_item IN SELECT * FROM public.order_items WHERE order_id = NEW.id
    LOOP
      -- Restore size-specific stock
      IF v_item.size IS NOT NULL AND v_item.size != '' AND v_item.size != 'N/A' THEN
        UPDATE public.product_stocks
        SET quantity = quantity + v_item.quantity
        WHERE product_id = v_item.product_id 
          AND size = v_item.size;
      END IF;

      -- Restore total product inventory
      UPDATE public.products
      SET inventory = inventory + v_item.quantity
      WHERE id = v_item.product_id;
    END LOOP;

    NEW.inventory_deducted := false;
  END IF;

  RETURN NEW;
END;
$$;

-- C. Create the trigger on the orders table
DROP TRIGGER IF EXISTS tr_manage_inventory_on_order_status ON public.orders;

CREATE TRIGGER tr_manage_inventory_on_order_status
  BEFORE INSERT OR UPDATE OF status, inventory_deducted ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_manage_inventory_on_order_status();

-- D. Cleanup old triggers that might conflict
DROP TRIGGER IF EXISTS tr_on_order_item_created ON public.order_items;
DROP FUNCTION IF EXISTS public.fn_auto_deduct_inventory();
