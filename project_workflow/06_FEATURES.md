# 06 FEATURES

## Product Objectives
- Capture wishlist items quickly and visually
- Preserve recurring obligations before discretionary spend
- Recommend the best purchases each payday
- Create a high-return, habit-forming experience
- Deliver a strong visual mood-board feel

## Feature Phases

### Phase 0 — Foundation (complete/partial)
- Supabase project and auth setup
- React + Vite SPA scaffold
- Tailwind CSS configuration
- Basic onboarding flow
- Wishlist CRUD and priority controls
- Budget form and Free Money calculation
- Profile page with user counts
- Quick purchase suggestions

### Phase 1 — Core Experience
- Multi-step onboarding with optional personal profile fields
- Wishlist board with category filters and sort
- Rapid add item capture dialog
- Fixed obligations manager with savings and subscriptions
- Profile card design and edit profile flow
- Responsive mobile-first navigation

### Phase 2 — Allocation Engine
- Payday screen with salary confirmation and deduction flow
- Allocation algorithm:
  - `score = (priority × 2) + (weeks_on_list × 0.5)`
  - greedy funding until balance depletes
- Buy This Month and Next Month lists
- Ability to promote/demote/skip items before allocation
- Purchased item state with celebration feedback
- Deferred rollover scoring

### Phase 3 — Polish & History
- Allocation history page and monthly cycle log
- Rich item detail view with image, emoji, notes, and edit
- Confetti/purchase celebration animation
- PWA support for installability and offline browse
- Currency preference and locale formatting
- UX copy that keeps the experience aspirational

### Phase 4 — Future Enhancements
- Google OAuth login
- Image URL upload or search-based image preview
- Payday reminders (notifications)
- Annual wrapped-style summary
- Mobile migration to Expo React Native

## Current Status Summary
- Implemented: onboarding, wishlist board, budget manager, profile page, suggestions flow
- Partially implemented: persistent user data, Supabase backend
- Not implemented: dedicated payday allocation screen, fixed expense breakdown, history, rich profile details, PWA support

## Priority Feature List
1. Payday allocation flow with buy/defer output
2. Fixed obligations manager and savings lock
3. Allocation history and cycle tracking
4. Rich profile card and onboarding personalization
5. Item detail/edit screen with notes, image, emoji
6. Purchase celebration and feedback
7. PWA installability and offline support
8. Google OAuth and improved auth UX
