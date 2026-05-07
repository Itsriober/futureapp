# 04 API SPEC

## Authentication
Supabase Auth handles all auth flows.

### Sign up
- `POST /auth/v1/signup`
- Body: `{ email, password, options: { data: { display_name } } }`
- Response: Supabase auth session or email confirmation instruction

### Sign in
- `POST /auth/v1/token?grant_type=password`
- Body: `{ email, password }`
- Response: session + access token

### Sign out
- `POST /auth/v1/logout`
- Requires auth header

## Profile Endpoints
### Get profile
- `GET /rest/v1/profiles?user_id=eq.{uid}`
- Auth: required
- Returns profile record

### Update profile
- `PATCH /rest/v1/profiles?user_id=eq.{uid}`
- Body: partial profile fields
- Auth: required

## Budget & Fixed Expenses
### Get budget
- `GET /rest/v1/budgets?user_id=eq.{uid}`
- Auth: required

### Upsert budget
- `POST /rest/v1/budgets`
- Body: `{ user_id, salary, rent, bills, subscriptions, savings }`
- Auth: required

### Get fixed expenses
- `GET /rest/v1/fixed_expenses?user_id=eq.{uid}`
- Auth: required

### Create fixed expense
- `POST /rest/v1/fixed_expenses`
- Body: `{ user_id, name, amount, frequency, is_savings }`
- Auth: required

### Update fixed expense
- `PATCH /rest/v1/fixed_expenses?id=eq.{id}`
- Body: partial expense fields
- Auth: required

### Delete fixed expense
- `DELETE /rest/v1/fixed_expenses?id=eq.{id}`
- Auth: required

## Wishlist Items
### Get wishlist items
- `GET /rest/v1/wishlist_items?user_id=eq.{uid}`
- Optional filters: `status=eq.active`, `category=eq.{category}`
- Auth: required

### Create wishlist item
- `POST /rest/v1/wishlist_items`
- Body: `{ user_id, name, estimated_cost, category, priority, notes, image_url, emoji, status }`
- Auth: required

### Update wishlist item
- `PATCH /rest/v1/wishlist_items?id=eq.{id}`
- Body: partial wishlist fields
- Auth: required

### Delete wishlist item
- `DELETE /rest/v1/wishlist_items?id=eq.{id}`
- Auth: required

## Payday Cycle & Allocation
### Get payday history
- `GET /rest/v1/payday_cycles?user_id=eq.{uid}&order=cycle_month.desc`
- Auth: required

### Create payday cycle
- `POST /rest/v1/payday_cycles`
- Body: `{ user_id, cycle_month, salary_amount, total_deductions, savings_amount, discretionary_balance }`
- Auth: required

### Get cycle allocations
- `GET /rest/v1/cycle_allocations?cycle_id=eq.{cycle_id}`
- Auth: required

### Create cycle allocations
- `POST /rest/v1/cycle_allocations`
- Body: array of `{ cycle_id, wishlist_item_id, status, allocated_at }`
- Auth: required

### Update allocation status
- `PATCH /rest/v1/cycle_allocations?id=eq.{id}`
- Body: `{ status, purchased_at }`
- Auth: required

## Business Logic API
These are optional custom endpoints for richer behavior.

### `POST /functions/allocate-payday`
- Input: `{ user_id, salary_amount, fixed_expenses, savings_amount, wishlist_items }`
- Output: `{ buy_this_month, deferred_next_month, discretionary_balance, projected_months }`
- Use case: run the allocation engine server-side if needed for consistency and auditing.

### `POST /functions/calculate-score`
- Input: `{ item, weeks_on_list }`
- Output: `{ score }`
- Use case: compute allocation score for transparency and UI explanation.

## Errors
- `401 Unauthorized` if auth header missing or invalid
- `403 Forbidden` if RLS denies access
- `400 Bad Request` for invalid payloads
- `500 Internal Server Error` for unexpected failures

## Notes
The current app uses Supabase REST endpoints directly and should keep this pattern in MVP. Custom Edge Functions are a future enhancement for the payday allocation engine and business rules.
