# 02 ARCHITECTURE

## App Topology
- Single-page application served by Vercel
- Supabase provides auth, database, and storage
- No separate Express backend in MVP
- Client calls Supabase directly for CRUD operations
- Local storage is used for instant UX and migration hints where appropriate

## Route Structure
- `/` — Landing / marketing page
- `/auth` — Sign in / register
- `/onboarding` — Multi-step onboarding flow
- `/app` — Wishlist board / default authenticated home
- `/app/budget` — Fixed obligations and budget manager
- `/app/suggestions` — Payday suggestions / allocation preview
- `/app/profile` — User profile and account settings

## Data Flow
1. User authenticates via Supabase auth
2. User profile and budget are loaded from Supabase
3. Wishlist items are fetched from the database and rendered in the board
4. Budget computes discretionary balance after fixed costs
5. Payday allocation engine allocates items into buy/defer lists
6. Allocation history is recorded in `payday_cycles` and `cycle_allocations`

## Component Layering
- Layout components: `AppShell`, navigation bar, page containers
- Core UI primitives: `Button`, `Input`, `Label`, `Dialog`, `Card`
- Feature components: `WishlistCard`, `AddItemDialog`, `ProfileCard`, `AllocationSummary`
- Page-level containers: `WishlistPage`, `BudgetPage`, `SuggestionsPage`, `ProfilePage`, `Onboarding`

## Deployment Topology
- Frontend deployed on Vercel
- Supabase project with Postgres and auth
- Environment variables stored in Vercel and .env for local development
- Optional future edge functions for custom allocation business rules

## Security Model
- Authenticated routes protected by Supabase session checks
- Row Level Security (RLS) on database tables scoped to `auth.uid()`
- All user data is private and only accessible by the authenticated owner
- No public sharing of user lists in MVP
