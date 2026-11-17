# Supabase SQL Schemas & Policies

This directory organizes all auxiliary SQL schemas, policies, and configuration scripts for the Maison e-commerce platform.

## Directory Structure

```plaintext
supabase/schemas/
├── consolidated_schema.sql       # All schemas & policies unified into a single idempotent script
├── cart_schema.sql               # Cart items table, RLS policies, and realtime publication
├── currency_setup.sql            # User currency preference columns & site_settings table
├── orders_schema.sql             # Orders RLS policies & realtime publication
├── product_stocks_schema.sql     # Realtime publication for size-specific inventory
├── products_schema.sql           # Realtime publication for catalog products
├── stock_access_policy.sql       # RLS policies for authenticated stock updates
└── wishlist_schema.sql           # Wishlist RLS policies & realtime publication
```

## How to Apply

### Option A: Apply All at Once (Recommended)
Open your [Supabase Dashboard](https://supabase.com/dashboard) -> **SQL Editor**, and execute the entire contents of [`consolidated_schema.sql`](./consolidated_schema.sql). It is idempotent and safe to run multiple times.

### Option B: Apply Modularly
If you only need specific functionality, run the individual `.sql` file in the Supabase SQL editor:
1. `currency_setup.sql`: If configuring multi-currency support.
2. `cart_schema.sql`: If enabling live cart synchronization.
3. `wishlist_schema.sql`: If setting up wishlist persistence and security.
4. `orders_schema.sql`: If configuring user order isolation.
5. `stock_access_policy.sql`: If enabling authenticated client inventory updates.

