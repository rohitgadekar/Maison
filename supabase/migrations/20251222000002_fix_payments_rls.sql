-- 1. Enable RLS (Should be already engaged, but good practice)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 2. Allow Admins to do EVERYTHING (Insert, Update, Delete)
CREATE POLICY "Admins can manage all payments"
    ON public.payments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- 3. Allow Users to Insert their OWN payments (Need for Checkout POD flow)
CREATE POLICY "Users can create their own payments"
    ON public.payments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
    );

-- 4. Allow Users to View their OWN payments (Already exists, but good to ensure coverage if we change things)
-- (We won't drop existing SELECT policies, these are additive)
