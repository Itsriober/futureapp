alter table wishlist_items
  add column if not exists url text,
  add column if not exists notes text;
