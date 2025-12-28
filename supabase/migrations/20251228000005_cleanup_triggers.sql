-- CLEANUP OF FAILED INVENTORY TRIGGERS
-- Reverting to explicit RPC management as triggers were firing too early for Online orders.

DROP TRIGGER IF EXISTS tr_manage_inventory_on_order_status ON public.orders;
DROP TRIGGER IF EXISTS tr_on_order_item_created ON public.order_items;

DROP FUNCTION IF EXISTS public.fn_manage_inventory_on_order_status();
DROP FUNCTION IF EXISTS public.fn_auto_deduct_inventory();
