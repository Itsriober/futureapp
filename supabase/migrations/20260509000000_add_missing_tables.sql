-- Phase 2 & 3 Schema Updates

-- 1. Extend Profiles
alter table public.profiles 
add column if not exists date_of_birth date,
add column if not exists mbti_type text,
add column if not exists hobbies jsonb default '[]'::jsonb,
add column if not exists favorite_food text,
add column if not exists favorite_music text,
add column if not exists favorite_color text,
add column if not exists city text,
add column if not exists bio text,
add column if not exists monthly_income numeric default 0,
add column if not exists currency text default 'KES';

-- 2. Fixed Expenses
create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null default 0,
  frequency text not null default 'monthly',
  is_savings boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fixed_expenses_user_id_idx on public.fixed_expenses (user_id);
alter table public.fixed_expenses enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can manage own fixed expenses') then
    create policy "Users can manage own fixed expenses" on public.fixed_expenses using (auth.uid() = user_id);
  end if;
end $$;

create or replace trigger update_fixed_expenses_updated_at
before update on public.fixed_expenses
for each row execute function public.update_updated_at_column();

-- 3. Payday Cycles
create table if not exists public.payday_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_month date not null default current_date,
  salary_amount numeric not null,
  total_deductions numeric not null,
  savings_amount numeric not null,
  discretionary_balance numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists payday_cycles_user_id_idx on public.payday_cycles (user_id);
alter table public.payday_cycles enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can view own payday cycles') then
    create policy "Users can view own payday cycles" on public.payday_cycles for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert own payday cycles') then
    create policy "Users can insert own payday cycles" on public.payday_cycles for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- 4. Cycle Allocations
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'allocation_status') then
    create type public.allocation_status as enum ('allocated', 'purchased', 'deferred');
  end if;
end $$;

create table if not exists public.cycle_allocations (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.payday_cycles(id) on delete cascade,
  wishlist_item_id uuid not null references public.wishlist_items(id) on delete cascade,
  status public.allocation_status not null default 'allocated',
  allocated_at timestamptz not null default now(),
  purchased_at timestamptz
);

alter table public.cycle_allocations enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can manage own allocations') then
    create policy "Users can manage own allocations" on public.cycle_allocations
    using (
      exists (
        select 1 from public.payday_cycles
        where id = cycle_allocations.cycle_id
        and user_id = auth.uid()
      )
    );
  end if;
end $$;
