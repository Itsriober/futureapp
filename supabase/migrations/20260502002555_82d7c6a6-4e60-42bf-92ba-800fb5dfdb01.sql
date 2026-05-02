-- Shared updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- PROFILES
-- =========================================================
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- BUDGETS
-- =========================================================
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  salary numeric not null default 0,
  rent numeric not null default 0,
  bills numeric not null default 0,
  subscriptions numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.budgets enable row level security;

create policy "Users can view own budget"
  on public.budgets for select using (auth.uid() = user_id);
create policy "Users can insert own budget"
  on public.budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budget"
  on public.budgets for update using (auth.uid() = user_id);
create policy "Users can delete own budget"
  on public.budgets for delete using (auth.uid() = user_id);

create trigger update_budgets_updated_at
before update on public.budgets
for each row execute function public.update_updated_at_column();

-- =========================================================
-- WISHLIST ITEMS
-- =========================================================
create type public.wishlist_status as enum ('active', 'purchased', 'archived');

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  price numeric not null default 0,
  category text not null default 'Other',
  priority smallint not null default 3 check (priority between 1 and 5),
  emoji text not null default '✨',
  status public.wishlist_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index wishlist_items_user_id_idx on public.wishlist_items (user_id);
create index wishlist_items_user_status_idx on public.wishlist_items (user_id, status);

alter table public.wishlist_items enable row level security;

create policy "Users can view own wishlist items"
  on public.wishlist_items for select using (auth.uid() = user_id);
create policy "Users can insert own wishlist items"
  on public.wishlist_items for insert with check (auth.uid() = user_id);
create policy "Users can update own wishlist items"
  on public.wishlist_items for update using (auth.uid() = user_id);
create policy "Users can delete own wishlist items"
  on public.wishlist_items for delete using (auth.uid() = user_id);

create trigger update_wishlist_items_updated_at
before update on public.wishlist_items
for each row execute function public.update_updated_at_column();