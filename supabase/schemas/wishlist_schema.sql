
-- Enable Row Level Security (RLS) for wishlist
alter table public.wishlist enable row level security;

-- Create policies (using upsert/on conflict if they don't exist is hard in pure SQL script without knowing state, 
-- but create policy throws if exists. I'll drop and recreate to be safe or just create with unique names if I could check)
-- Simplest is to just try creating them. If they fail, it means they might exist.
-- But for this task, I will provide the standard set.

create policy "Users can view their own wishlist items"
  on public.wishlist for select
  using (auth.uid() = user_id);

create policy "Users can insert their own wishlist items"
  on public.wishlist for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own wishlist items"
  on public.wishlist for delete
  using (auth.uid() = user_id);

-- Create a realtime publication for wishlist to enable live syncing
alter publication supabase_realtime add table public.wishlist;
