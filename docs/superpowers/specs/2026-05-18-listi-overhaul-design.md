# Listi Overhaul Design Spec
**Date:** 2026-05-18  
**Status:** Approved  
**Approach:** Visual overhaul → New features → Tech & performance

---

## 1. Overview

A three-phase improvement to the Listi app covering a full visual overhaul, four new features, and a technical foundation upgrade. The app remains a mobile-first PWA deployed on Vercel, backed by Supabase.

**Phases:**
1. **Visual** — Dashboard home, wishlist card redesign, skeleton loaders, dark mode, polish
2. **Features** — Target dates, analytics charts, spending streak, savings progress tracker
3. **Tech** — React Query, Supabase Storage avatars, TypeScript types, Zod validation, dead code removal

---

## 2. Navigation & Route Architecture

### Removed routes
| Route | Reason |
|---|---|
| `src/routes/app.budget.tsx` | Legacy page superseded by expenses. Never in nav. |
| `src/routes/app.suggestions.tsx` | Absorbed into Dashboard Top Picks widget. Never in nav. |

### Renamed routes
| Old | New |
|---|---|
| `src/routes/app.index.tsx` (renders at `/app/`) | Becomes wishlist at `/app/wishlist` |
| New file at `src/routes/app.index.tsx` | Dashboard at `/app/` (home) |
| `src/routes/app.wishlist.$id.tsx` | `src/routes/app.wishlist.$id.tsx` (no change, path stays `/app/wishlist/$id`) |

### Bottom navigation — 5 tabs
```
[ 🏠 Home ] [ ✨ Wishlist ] [ 💼 Expenses ] [ 💸 Payday ] [ 👤 You ]
```
Icons: `Home`, `Sparkles`, `Wallet`, `DollarSign`, `User` from lucide-react.

Active tab: filled background pill (existing style). History remains reachable via Dashboard quick-action and Profile link — no dedicated tab.

---

## 3. Phase 1 — Visual Overhaul

### 3.1 Dashboard Home (`/app/`)

Four distinct vertical zones, all fetched on mount with a single React Query composite hook.

**Zone 1 — Hero Financial Card**
- Full-width card with `bg-gradient-warm` (coral→amber), white text
- Primary stat: "Free This Month" — discretionary balance in large `font-display text-5xl`
- Two sub-stats in a row: Salary In / Total Committed
- Thin progress bar: `% of income committed to fixed costs`
- Savings Lock badge if `totalSavings > 0`: `🔒 KES X locked`
- Skeleton: shimmer rectangle matching the card shape

**Zone 2 — Top Picks**
- Heading: "Top Picks" with a subtle `Sparkles` icon
- Up to 3 highest-scored active wishlist items (score = priority×2 + weeks×0.5)
- Each pick: emoji thumbnail, name (truncated), price, affordability chip
  - Affordability chip: `✓ Affordable` (green, `bg-green-50 text-green-600`) when `price ≤ freeMoneyBalance`
  - Otherwise: `KES X away` (muted)
- Tapping a pick navigates to `/app/wishlist/$id`
- Empty state: "Add items to your wishlist to see picks" with link to `/app/wishlist`
- Skeleton: 2 shimmer rows

**Zone 3 — Stats Row (Streak + Savings)**
- Two compact cards side by side
- Left: 🔥 `N` streak badge + "payday cycles" label
- Right: Savings progress bar — `(savingsLockPerMonth × cyclesCount)` toward next KES 10,000 milestone. Label: "KES X saved (est.)"
- Skeleton: 2 shimmer squares

**Zone 4 — Quick Actions**
- Two pill buttons: `Run Payday →` (navigates to `/app/payday`) and `View History →` (navigates to `/app/history`)

---

### 3.2 Wishlist Redesign (`/app/wishlist`)

**Category color map** — defined once in `src/lib/data.ts`:
```ts
export const CATEGORY_COLOR: Record<Category, string> = {
  Tech: "bg-blue-500",
  Fashion: "bg-pink-500",
  Experience: "bg-teal-500",
  Food: "bg-amber-500",
  Home: "bg-green-500",
  Other: "bg-coral",
};
```

**New WishlistCard layout:**
```
┌─────────────────────────────────────────┐
│ ▌ [4px left border, category color]     │
│   [emoji 64px]  Name             [🗑]   │
│                 Category · N weeks ago   │
│                                          │
│   KES XX,XXX        ● ● ● ○ ○  Priority │
│   [✓ Affordable] or [KES X away]         │
│   [══════════════════░░░░░░░░] 72%       │
└─────────────────────────────────────────┘
```

- Left border: 4px solid, category color, full card height
- Affordability progress bar: `(freeBalance / price) * 100`, capped at 100%, color transitions green when ≥ 100%
- "N weeks ago": computed from `created_at`, shown in `text-xs text-muted-foreground`
- Delete button: visible on hover (desktop) / always visible (mobile, detected via `use-mobile` hook)
- Entrance animation: cards stagger in with 50ms delay increments using `animate-scale-in`

**Filter bar:** keeps existing pill style; each pill gets a small colored dot matching the category color.

**Empty state:** Inline SVG of a simple wishlist scroll (monoline, matches the brand palette) + heading + subtext + "Add a want" button.

**Skeleton:** 3 shimmer cards on initial load.

**Affordability data:** Dashboard already fetches free money. Wishlist page fetches it independently via its own React Query query (same key = cache hit, no extra request).

---

### 3.3 Item Detail Page (`/app/wishlist/$id`)

- Add **target date field**: "I want this by" — optional date input, saved to `wishlist_items.target_date`
- Countdown chip below the date: `📅 23 days` (neutral), `⚠️ 6 days left` (amber, `< 7 days`), `❌ Overdue` (red)
- Replace `confirm()` for delete with shadcn `AlertDialog` (already installed in project)
- Score visualization: keep existing text breakdown, add a small horizontal bar showing score relative to the user's highest-scored item (gives context)

---

### 3.4 Skeleton Loaders

Single reusable `<Skeleton />` from shadcn (already in project, not currently used). Applied on every async screen:

| Screen | Skeleton pattern |
|---|---|
| Dashboard | Hero card shape + 2 pick rows + 2 stat squares |
| Wishlist | 3 card shapes |
| Expenses | Salary input + 3 expense rows |
| Payday | Salary field + commitments list |
| History | 2 cycle card shapes |
| Item detail | Emoji circle + 3 form field rows |

---

### 3.5 Dark Mode Toggle

- Location: Profile page header, right side — `Sun` / `Moon` icon button (lucide-react)
- On click: toggles `.dark` class on `document.documentElement`
- Persists to `localStorage` under key `ff.theme`
- Applied on app init in `src/main.tsx` before React renders (avoids flash)
- No system preference detection — explicit user toggle only

---

### 3.6 General Polish

- **Page transitions:** Apply `animate-fade-in` to every route's root `<div>` consistently (several routes currently missing it)
- **AlertDialog for delete:** Replace `confirm()` in `app.wishlist.$id.tsx` with `AlertDialog`
- **Toast improvements:** Add `position="top-center"` to Sonner's `<Toaster>` in `__root.tsx`. Include item name in success toasts where relevant (e.g., "Sony headphones added ✓")
- **Payday "Buy" button:** Currently a no-op in the payday result screen. Wire it to mark the item as `purchased` and dispatch `wishlist-updated`

---

## 4. Phase 2 — New Features

### 4.1 Item Target Date

**DB change:** `ALTER TABLE wishlist_items ADD COLUMN target_date DATE NULL;`

**UI:** Optional date input on item detail page (below Priority section). No change to AddItemDialog (keep it fast — date is an edit-time detail).

**Display:**
- Wishlist card: shows countdown chip if target_date is set, positioned below the affordability bar
- Dashboard top picks: same countdown chip
- Logic in `src/lib/data.ts`:
  ```ts
  export function getCountdown(targetDate: string | null): { label: string; variant: "normal" | "warning" | "overdue" } | null
  ```

---

### 4.2 Analytics (History page enhancement)

**No new route.** The History page gains a collapsible "Analytics" section above the cycle list, shown only when `cycles.length >= 2`.

**Chart 1 — Monthly Bar Chart** (recharts `BarChart`)
- X axis: month/year of each cycle
- Two bars per month: Discretionary Balance (coral) vs. total item prices allocated (indigo)
- Helps visualise over- vs. under-spending

**Chart 2 — Category Donut** (recharts `PieChart` with `innerRadius`)
- Segments: sum of allocated item prices grouped by category
- Uses the same category color map as wishlist cards
- Legend below the chart

Both charts are responsive via recharts' `ResponsiveContainer`. No new data fetching — computed from the cycles data already loaded on the page.

---

### 4.3 Spending Streak

**DB change:** `ALTER TABLE profiles ADD COLUMN streak INTEGER DEFAULT 0 NOT NULL;`

**Streak logic** (runs inside `saveCycle` in `app.payday.tsx` after a successful cycle save):
1. Fetch the most recent previous cycle for this user
2. If the gap between that cycle's `cycle_month` and today is ≤ 35 days → increment streak
3. If gap > 35 days → reset streak to 1
4. If no previous cycle → set streak to 1
5. Update `profiles.streak`

**Display:** Dashboard Zone 3, left card: `🔥 N` in `font-display text-3xl` + "cycle streak" label. Streak of 0 shows "Start your streak" in muted text.

---

### 4.4 Savings Progress Tracker

**No new DB column.** Computed from existing data:

```
estimatedSavings = savingsLockPerMonth × cyclesCount
nextMilestone = Math.ceil(estimatedSavings / 10000) * 10000  (minimum 10,000)
progress = estimatedSavings / nextMilestone
```

**Display:** Dashboard Zone 3, right card:
- `KES X,XXX saved (est.)` in `font-display text-xl`
- Thin progress bar toward next milestone
- Label: `Next milestone: KES Y,XXX`
- Tooltip/note: "Estimated from your savings lock × payday cycles"
- If no savings lock set: "Set a savings lock in Expenses to track progress"

---

## 5. Phase 3 — Tech & Performance

### 5.1 React Query

Install is already present (`@tanstack/react-query ^5.83.0`). 

**Setup:**
- Add `QueryClient` + `QueryClientProvider` wrapping the router in `src/main.tsx`

**Query keys convention:**
```ts
["wishlist", userId]           // active wishlist items
["budget", userId]             // budget/salary row
["expenses", userId]           // fixed_expenses rows
["profile", userId]            // profile row
["cycles", userId]             // payday_cycles with allocations
```

**Migration approach:** Replace `useEffect` + `useState` pairs screen by screen. Each screen gets a dedicated `useQuery` call. Mutations use `useMutation` with `queryClient.invalidateQueries` on success. Optimistic updates applied to wishlist add/delete/priority.

---

### 5.2 Supabase Storage for Avatars

**New storage bucket:** `avatars` — public read, authenticated write, max file size 2MB.

**Migration:** On profile save, if `avatar_url` starts with `data:` (base64), upload to Storage first, get the public URL, store that instead. Existing base64 values are migrated lazily on next profile save — no bulk migration needed.

**Upload flow in `app.profile.tsx`:**
1. User picks file or rolls dice (DiceBear URL stays as-is, no upload needed)
2. For file uploads: `supabase.storage.from("avatars").upload(path, file)`
3. Get public URL via `supabase.storage.from("avatars").getPublicUrl(path)`
4. Store URL in `profiles.avatar_url`

---

### 5.3 TypeScript Types

Run `supabase gen types typescript --local > src/integrations/supabase/types.ts` after applying all migrations. This removes all `as any` casts on `fixed_expenses`, `payday_cycles`, and `cycle_allocations`. The `Database` type then covers all tables.

---

### 5.4 Zod Validation

**Schemas in `src/lib/schemas.ts`** (new file):
```ts
export const newItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  price: z.number().positive("Price must be greater than 0"),
  category: z.enum(CATEGORIES),
  priority: z.number().int().min(1).max(5),
  target_date: z.string().date().nullable().optional(),
});

export const expenseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().nonnegative("Amount can't be negative"),
  is_savings: z.boolean(),
});

export const salarySchema = z.number().positive("Salary must be greater than 0");
```

Errors displayed inline below each input using a small `text-destructive text-xs` helper.

---

### 5.5 Dead Code Removal

- Delete `src/routes/app.budget.tsx`
- Delete `src/routes/app.suggestions.tsx`
- Remove `migrateLocalDataIfNeeded` from `src/lib/data.ts` and its call in `src/routes/app.tsx` — localStorage migration is complete for any existing users; the function is a security risk (reads arbitrary localStorage data)
- Remove unused imports that result from the above

---

## 6. Database Migrations Summary

| Migration | SQL |
|---|---|
| Add target date to wishlist items | `ALTER TABLE wishlist_items ADD COLUMN target_date DATE NULL;` |
| Add streak to profiles | `ALTER TABLE profiles ADD COLUMN streak INTEGER NOT NULL DEFAULT 0;` |
| Create avatars storage bucket | Via Supabase dashboard or `supabase storage create avatars --public` |

Both SQL migrations go into `supabase/migrations/` with timestamped filenames.

---

## 7. Security Considerations

- **Avatar uploads:** Stored in Supabase Storage with a RLS policy: users can only write to `avatars/{user_id}/*`. Public read is safe (URLs are non-guessable UUIDs).
- **Zod validation:** All user inputs validated before hitting Supabase. Prevents empty/negative values reaching the DB.
- **localStorage migration removal:** `migrateLocalDataIfNeeded` reads and parses arbitrary localStorage JSON — removing it closes a minor XSS amplification path.
- **No new auth surface introduced:** All existing Supabase RLS policies remain unchanged.

---

## 8. What's Explicitly Out of Scope

- Multi-currency support (KES stays hardcoded)
- Push notifications / PWA background sync
- Social features (sharing wishlists publicly)
- Price tracking via URL scraping
- Goal-setting UI for savings (auto-calculated milestone only)
- System dark mode preference detection (manual toggle only)

---

## 9. Implementation Order

1. DB migrations (target_date, streak columns)
2. Regenerate TypeScript types
3. React Query setup in main.tsx
4. Delete dead routes (budget, suggestions)
5. New Dashboard home screen
6. Wishlist card redesign + category colors
7. Skeleton loaders across all screens
8. Dark mode toggle
9. Item detail: target date + AlertDialog
10. Polish pass (transitions, toasts, Payday "Buy" button)
11. Analytics charts in History
12. Spending streak logic in Payday + display on Dashboard
13. Savings progress tracker on Dashboard
14. Supabase Storage avatar migration
15. Zod validation on all forms
16. TypeScript `as any` cleanup
