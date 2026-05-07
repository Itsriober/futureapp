# 07 IMPLEMENTATION PLAN

## Current Status Checkpoint
- Current app has a working React SPA with Supabase integration for wishlist items, budgets, profiles, and suggestions.
- Existing pages: onboarding, wishlist board, budget manager, suggestions, profile.
- Core missing MVP pieces: payday allocation, fixed expenses list, history, item detail, rich profile, PWA.

## Next Action Plan

### Week 1 — Stabilize and complete core allocation
- Build a standalone `PaydayPage` at `/app/payday`
- Implement the allocation algorithm based on Listi brief
- Add `payday_cycles` and `cycle_allocations` persistence
- Add buy/defer result UI with item reasoning tags
- Add ability to mark allocations as purchased

### Week 2 — Fixed obligations and profile completion
- Build `FixedExpenseManager` with recurring cost items and savings lock
- Extend onboarding to support optional user profile fields
- Add profile card UI in `/app/profile` with data preview
- Add currency preference and local formatting support

### Week 3 — Wishlist polish and item detail
- Add item detail/edit page or modal for full item metadata
- Improve wishlist board visual layout with responsive card grid
- Add filter and sort controls by category, priority, cost, and date added
- Upgrade item capture flow to faster floating action workflow

### Week 4 — History and experience polish
- Build allocation history page at `/app/history`
- Add a simple cycle summary view and purchase/defer counts
- Add purchase celebration animation and success feedback
- Review copy to keep payday language aspirational, not punitive

### Week 5 — PWA and deployment polish
- Add manifest, service worker, and offline browse support
- Validate mobile-first layout and install prompt
- Finalize Supabase integration and deploy to Vercel
- Prepare a product demo summary and release notes

## Risk Mitigation
- Keep every new feature behind a clear route and scope
- Use feature flags or route gating for not-yet-complete pages
- Start with basic Supabase RLS before any advanced edge functions
- Validate allocation algorithm with sample wishlist data early

## Milestones
- Milestone 1: Stable wishlist + budget + onboarding flow
- Milestone 2: Payday allocation engine + fixed obligations
- Milestone 3: Profile richness + item detail + history
- Milestone 4: PWA, polish, and first deploy

## Acceptance Criteria
- User can add wishlist items in under 15 seconds
- User can enter salary and see an allocation recommendation
- Discretionary spend is always calculated after fixed obligations and savings
- Allocation history is recorded and accessible
- The wishlist board feels visually engaging and mobile-friendly
