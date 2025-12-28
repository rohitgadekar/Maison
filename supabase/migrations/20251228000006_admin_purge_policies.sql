-- ADMIN PURGE POLICIES
-- This migration grants admins the permission to permanently delete records
-- from the order registry.

-- 1. Orders Delete Policy
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders"
ON public.orders FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Order Items Delete Policy
-- Even though we have CASCADE, explicit front-end deletes need this.
DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;
CREATE POLICY "Admins can delete order items"
ON public.order_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Payments Delete Policy
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
CREATE POLICY "Admins can delete payments"
ON public.payments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
