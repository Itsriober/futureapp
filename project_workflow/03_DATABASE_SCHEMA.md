# 03 DATABASE SCHEMA

## Overview
The schema is built for private user data and flexible wishlist allocation. It supports profile data, wishlist items, recurring fixed obligations, payday cycles, and allocation history.

## Tables

### profiles
- `id` uuid primary key
- `user_id` uuid references auth.users(id)
- `display_name` text
- `avatar_url` text
- `date_of_birth` date
- `zodiac_sign` text
- `mbti_type` text
- `hobbies` jsonb
- `favorite_food` text
- `favorite_music` text
- `favorite_color` text
- `city` text
- `bio` text
- `monthly_income` numeric
- `currency` text default 'KES'
- `payday_date` int
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

### budgets
- `id` uuid primary key
- `user_id` uuid references auth.users(id)
- `salary` numeric
- `rent` numeric
- `bills` numeric
- `subscriptions` numeric
- `savings` numeric default 0
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

### fixed_expenses
- `id` uuid primary key
- `user_id` uuid references auth.users(id)
- `name` text
- `amount` numeric
- `frequency` text default 'monthly'
- `is_savings` boolean default false
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

### wishlist_items
- `id` uuid primary key
- `user_id` uuid references auth.users(id)
- `name` text not null
- `estimated_cost` numeric not null
- `category` text not null
- `priority` int not null default 3
- `notes` text
- `image_url` text
- `emoji` text
- `status` text not null default 'active'
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

### payday_cycles
- `id` uuid primary key
- `user_id` uuid references auth.users(id)
- `cycle_month` date not null
- `salary_amount` numeric not null
- `total_deductions` numeric not null
- `savings_amount` numeric not null
- `discretionary_balance` numeric not null
- `created_at` timestamptz default now()

### cycle_allocations
- `id` uuid primary key
- `cycle_id` uuid references payday_cycles(id)
- `wishlist_item_id` uuid references wishlist_items(id)
- `status` text not null
- `allocated_at` timestamptz default now()
- `purchased_at` timestamptz

## Enums
- `wishlist_category` = ['Buy', 'Eat', 'Go', 'Grow', 'Home', 'Experience']
- `wishlist_status` = ['active', 'purchased', 'deferred', 'archived']
- `allocation_status` = ['allocated', 'purchased', 'deferred']

## RLS Strategy
- `profiles`, `budgets`, `fixed_expenses`, `wishlist_items`, `payday_cycles`, `cycle_allocations` all enforce `user_id = auth.uid()`
- Public read access only for landing content; authenticated-only access for all core data

## Notes
The current repo already includes `profiles`, `budgets`, and `wishlist_items` concepts. This schema extends that foundation with `fixed_expenses`, `payday_cycles`, and `cycle_allocations` to complete the Listi brief.
