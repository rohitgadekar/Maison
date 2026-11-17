
-- Create a realtime publication for product_stocks table to enable live syncing of size-specific inventory
alter publication supabase_realtime add table public.product_stocks;
