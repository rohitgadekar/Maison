
-- Policy for allowing authenticated users to update product stocks (e.g. for decrementing on purchase or restoring on cancel)
-- Ideally this should be more restricted (e.g. via function), but for direct client-side update from this codebase:
create policy "Enable update for authenticated users"
  on public.products for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users on product_stocks"
  on public.product_stocks for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
