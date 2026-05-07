# 01 TECH STACK

## Frontend
- React 18+ with Vite
- TypeScript (strict mode)
- Tailwind CSS for utility-driven styling and responsive layout
- TanStack Router for client navigation
- Zustand for local and UI state management where needed
- Framer Motion for polished microanimations and transitions
- Lucide icons for lightweight iconography
- Sonner for toast notifications

## Backend
- Supabase for auth, database, and storage
- Supabase Auth for email/password and future Google OAuth
- Supabase Postgres for private user data and row-level security
- Supabase storage for uploaded item images

## Database
- PostgreSQL schema managed in Supabase
- Tables: profiles, wishlist_items, budgets, fixed_expenses, payday_cycles, cycle_allocations
- Database-driven business logic via RLS and server-side validation

## Hosting & Deployment
- Vercel for frontend deployment and preview deployments
- Supabase managed backend for database and authentication

## Future Mobile Stack
- Expo + React Native
- NativeWind for Tailwind-style mobile styling
- Zustand and TanStack Query retained for state and data
- Supabase JS SDK reused across web and mobile

## Developer Tooling
- Bun or npm/yarn supported by existing repo
- ESLint configuration from `eslint.config.js`
- TypeScript configuration in `tsconfig.json`
- Vite configuration in `vite.config.ts`
- Optional Prettier formatting based on repo conventions

## Notes
This stack is chosen to keep the product aligned with the Listi brief: a lightweight, mobile-first SPA with minimal backend overhead and a clean migration path to React Native.
