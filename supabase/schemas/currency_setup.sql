---
--- 1. PROFILE EXTENSION - Storing user preference
---
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS primary_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS live_conversion_enabled BOOLEAN DEFAULT false;

---
--- 2. SITE SETTINGS - Store base shop currency
---
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

INSERT INTO public.site_settings (key, value)
VALUES ('shop_currency', 'USD')
ON CONFLICT (key) DO NOTHING;
