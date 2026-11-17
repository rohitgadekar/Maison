
-- Create a realtime publication for products to enable live syncing of inventory
-- Check if publication exists first or just add table (Supabase allows adding table to existing pub)
alter publication supabase_realtime add table public.products;
