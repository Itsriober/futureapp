create table if not exists price_history (
  id uuid primary key default gen_random_uuid(),
  wishlist_item_id uuid not null references wishlist_items(id) on delete cascade,
  price numeric(12,2) not null,
  recorded_at timestamptz not null default now()
);

alter table price_history enable row level security;

-- Access via wishlist_items ownership
create policy "Users manage own price history"
  on price_history for all
  using (
    exists (
      select 1 from wishlist_items wi
      where wi.id = price_history.wishlist_item_id
        and wi.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from wishlist_items wi
      where wi.id = price_history.wishlist_item_id
        and wi.user_id = auth.uid()
    )
  );
