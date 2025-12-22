
-- 1. Drop existing policies if they exist to prevent "already exists" errors
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;

-- 2. Create/Update the payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    transaction_id TEXT UNIQUE,
    payment_method TEXT,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL,
    cf_payment_id TEXT,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Ensure RLS is enabled
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. Create Admin Policy (using your user_roles table)
CREATE POLICY "Admins can view all payments"
    ON public.payments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- 5. Create User Policy
CREATE POLICY "Users can view their own payments"
    ON public.payments FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
