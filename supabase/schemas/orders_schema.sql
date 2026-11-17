
-- Enable Row Level Security (RLS) for orders if not already
alter table public.orders enable row level security;

-- Create policies for orders (if not existing)
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own orders"
  on public.orders for update
  using (auth.uid() = user_id);

-- Create a realtime publication for orders to enable live syncing
alter publication supabase_realtime add table public.orders;
