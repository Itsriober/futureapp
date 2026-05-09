# Listi: Intentional Wishlist & Payday Allocator 💸✨

Listi is a personal finance and lifestyle application designed to replace impulsive online shopping with intentional, budget-aware allocation. It allows you to capture the things you want, prioritize them, and allocate funds when "Payday" arrives based on your actual discretionary income.

## Features

- **Capture at the Speed of Thought**: Use the Floating Action Button (FAB) from any screen to instantly add a want with its estimated cost, category, and priority.
- **Smart Scoring Engine**: Listi uses a time-weighted scoring algorithm (`Score = (Priority × 2) + (Weeks on list × 0.5)`). Older, lower-priority wants naturally climb the ranks so they aren't forgotten.
- **Theatrical Payday Flow**: When salary arrives, enter your take-home pay. Listi automatically deducts fixed obligations and "Savings Locks," then calculates your discretionary balance and reveals exactly which items from your wishlist you can afford this month.
- **Fixed Expenses & Savings Locks**: Manage recurring bills (rent, utilities) and lock in savings goals so they are protected before discretionary spending occurs.
- **Rich User Profiles**: "Spotify Wrapped" style identity cards with auto-calculated Zodiac signs, MBTI types, Hobbies, and customizable Avatars (via DiceBear HTTP API or custom uploads).
- **Progressive Web App (PWA)**: Installable on mobile devices with support for offline viewing.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, custom "Glide-inspired" CSS variables, Framer Motion (via `tw-animate-css`)
- **Routing**: TanStack Router (File-based routing)
- **Backend/BaaS**: Supabase (PostgreSQL, Auth, Row Level Security)
- **UI Components**: shadcn/ui (Radix UI), Lucide Icons
- **Avatars**: DiceBear HTTP API

## Local Development

### Prerequisites
- Node.js (v18+)
- npm or bun
- A Supabase project (Free tier works perfectly)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/listi.git
   cd listi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Database Setup:**
   Run the migration files located in `supabase/migrations` against your Supabase database to set up the necessary tables (`profiles`, `wishlist_items`, `budgets`, `fixed_expenses`, `payday_cycles`, `cycle_allocations`) and Row Level Security (RLS) policies.
   You can do this via the Supabase Dashboard SQL Editor or the Supabase CLI:
   ```bash
   npx supabase db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The app will be running at `http://localhost:8080`.

## Deployment (Vercel)

Listi is optimized for deployment on Vercel.

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Vercel will automatically detect the Vite framework and configure the build settings (`npm run build` and `dist` output directory).
4. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Environment Variables in the Vercel project settings.
5. Deploy!

For SPA routing to work correctly on Vercel without SSR, a `vercel.json` file is included in the repository.

## Architecture & Schema Highlights

- **`wishlist_items`**: Core table holding user desires. Uses a `status` enum (`active`, `purchased`, `archived`).
- **`fixed_expenses`**: Recurring costs. Includes a boolean `is_savings` to treat specific line items as protected savings.
- **`payday_cycles`**: A historical snapshot of a given payday, storing the total salary, deductions, and resulting discretionary balance.
- **`cycle_allocations`**: A junction table linking a `payday_cycle` to specific `wishlist_items` that were funded during that cycle.

---
*Built with 🖤 by Illustriober Creatives*
