
-- Create the cart_items table
create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  product_id uuid references public.products not null,
  quantity integer default 1,
  size text,
  unique(user_id, product_id, size)
);

-- Enable Row Level Security (RLS)
alter table public.cart_items enable row level security;

-- Create policies
create policy "Users can view their own cart items"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cart items"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cart items"
  on public.cart_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own cart items"
  on public.cart_items for delete
  using (auth.uid() = user_id);

-- Create a realtime publication for cart_items to enable live syncing
alter publication supabase_realtime add table public.cart_items;
