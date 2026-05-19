create table if not exists category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  monthly_limit numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category)
);

alter table category_budgets enable row level security;

create policy "Users manage own category budgets"
  on category_budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
