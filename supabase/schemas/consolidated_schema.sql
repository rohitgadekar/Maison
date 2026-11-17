-- ==============================================================================
-- MAISON ARCHIVAL PLATFORM — CONSOLIDATED DATABASE SCHEMAS & POLICIES
-- ==============================================================================
-- This script aggregates all auxiliary schemas, tables, RLS policies,
-- and realtime publications needed for the Maison application.
-- Run this script in the Supabase SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SITE SETTINGS & USER CURRENCY CONFIGURATION
-- ------------------------------------------------------------------------------

-- Extend profiles with currency preferences
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS primary_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS live_conversion_enabled BOOLEAN DEFAULT false;

-- Create site_settings table for global store configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed default shop currency
INSERT INTO public.site_settings (key, value)
VALUES ('shop_currency', 'USD')
ON CONFLICT (key) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 2. CART ITEMS SCHEMA & ROW-LEVEL SECURITY
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES public.products NOT NULL,
  quantity INTEGER DEFAULT 1,
  size TEXT,
  UNIQUE(user_id, product_id, size)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own cart items' AND tablename = 'cart_items') THEN
    CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own cart items' AND tablename = 'cart_items') THEN
    CREATE POLICY "Users can insert their own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own cart items' AND tablename = 'cart_items') THEN
    CREATE POLICY "Users can update their own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own cart items' AND tablename = 'cart_items') THEN
    CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 3. WISHLIST ROW-LEVEL SECURITY
-- ------------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.wishlist ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own wishlist items' AND tablename = 'wishlist') THEN
    CREATE POLICY "Users can view their own wishlist items" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own wishlist items' AND tablename = 'wishlist') THEN
    CREATE POLICY "Users can insert their own wishlist items" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own wishlist items' AND tablename = 'wishlist') THEN
    CREATE POLICY "Users can delete their own wishlist items" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 4. ORDERS ROW-LEVEL SECURITY
-- ------------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own orders' AND tablename = 'orders') THEN
    CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own orders' AND tablename = 'orders') THEN
    CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own orders' AND tablename = 'orders') THEN
    CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 5. STOCK & INVENTORY ACCESS POLICIES
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable update for authenticated users' AND tablename = 'products') THEN
    CREATE POLICY "Enable update for authenticated users" ON public.products FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable update for authenticated users on product_stocks' AND tablename = 'product_stocks') THEN
    CREATE POLICY "Enable update for authenticated users on product_stocks" ON public.product_stocks FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 6. REALTIME PUBLICATIONS
-- ------------------------------------------------------------------------------
-- Enables real-time WebSocket syncing for live inventory and cart updates

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.product_stocks;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication
  END;
END $$;

