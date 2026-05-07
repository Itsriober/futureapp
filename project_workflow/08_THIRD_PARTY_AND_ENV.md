# 08 THIRD PARTY AND ENV

## Third-Party Services

### Supabase
- Auth (email/password, future Google OAuth)
- Postgres database
- Storage for wishlist images
- Row-level security for private user data
- Server-side functions for future allocation and reminders

### Vercel
- Frontend hosting
- Continuous deployment from GitHub
- Environment variable management

### Optional future services
- Image search API for wishlist image suggestions
- Push notification provider for payday reminders
- Analytics service for user engagement tracking

## Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — only for secure server logic if used in edge functions
- `VITE_APP_NAME` — optional app branding override
- `VITE_DEFAULT_CURRENCY` — default currency code, e.g. `KES`

## Local Development
- Use `.env` or local environment management to store Supabase values
- Keep secrets out of source control
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are available before running the app

## Notes
- Supabase handles most server-side needs for MVP. Avoid adding a separate backend unless allocation business rules require strict server-side locking.
- For mobile migration, the same Supabase environment can be reused with React Native.
