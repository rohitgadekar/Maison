-- Add images array to products table (keeping image_url for backward compatibility)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] DEFAULT ARRAY[]::text[];

-- Add tracking_number to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;

-- Create saved_addresses table for users
CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Home',
  full_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'United States',
  phone text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on saved_addresses
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_addresses
CREATE POLICY "Users can view own saved addresses"
  ON public.saved_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved addresses"
  ON public.saved_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved addresses"
  ON public.saved_addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved addresses"
  ON public.saved_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at on saved_addresses
CREATE TRIGGER update_saved_addresses_updated_at
  BEFORE UPDATE ON public.saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing products with sample images
UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=750&fit=crop'
] WHERE category = 'Clothing' AND images = '{}';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=750&fit=crop'
] WHERE category = 'Bags' AND images = '{}';

UPDATE public.products SET images = ARRAY[
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=750&fit=crop'
] WHERE category = 'Jewelry' AND images = '{}';