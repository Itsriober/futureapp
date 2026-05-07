# 05 PAGES AND COMPONENTS

## Page Map

### Unauthenticated
- `/` — Landing page / product intro
- `/auth` — Login / register page
- `/onboarding` — Multi-step onboarding flow after registration

### Authenticated
- `/app` — Wishlist board and quick capture
- `/app/budget` — Budget manager and fixed cost overview
- `/app/suggestions` — Payday/intentional spend suggestions
- `/app/profile` — Rich personal profile and account settings
- future: `/app/history` — Allocation history and payday performance
- future: `/app/item/:id` — Wishlist item detail and edit screen

## Core Components

### Layout
- `AppShell`
  - Bottom navigation bar on mobile
  - Wraps authenticated pages
  - Keeps content centered and scrollable

### Wishlist
- `WishlistCard`
  - Visual card showing emoji/image, name, category, cost, priority
  - Priority controls and delete action
- `AddItemDialog`
  - Floating-action dialog for rapid capture
  - Required fields: name, price, category
  - Optional fields: priority, notes, image
- `WishlistBoard`
  - Filter chips by category
  - Responsive grid or stacked card list
  - Empty state encouraging first capture

### Budget & Obligations
- `BudgetSummary`
  - Shows Free Money after fixed costs
  - Visual usage meter and commitment ratio
- `BudgetForm`
  - Salary, rent, bills, subscriptions, savings
  - Single-screen edit with instant feedback
- `FixedExpenseList`
  - Recurring costs tracker
  - Add / edit / delete fixed obligation items

### Payday & Allocation
- `PaydayFlow`
  - Salary input and confirmation
  - Progressive reveal of deductions and discretionary balance
  - `AllocationResult` showing Buy This Month and Next Month lists
- `AllocationCard`
  - Shows why item was funded (`High priority`, `Waited 4 weeks`)
  - Allows override/promote/demote/skip
- `AllocationTimeline`
  - Projected month for deferred items

### Profile & Onboarding
- `OnboardingSteps`
  - Multi-step profile form with optional fields
  - Always collects name and income first
  - Live profile preview
- `ProfileCard`
  - Rich visual card with zodiac, hobbies, favorite color, personality type
  - Summary counts and quick stats
- `ProfileEditor`
  - Editable personal details and currency preference

### History & Feedback
- `HistoryTimeline`
  - List of past payday cycles with key metrics
  - Totals for purchased vs deferred items
- `PurchaseCelebration`
  - Small confetti animation or checkmark reward
  - Triggered when an item is marked purchased

## Existing Components in Current Codebase
- `AppShell` — present and used for navigation
- `WishlistCard` — implemented with priority controls and delete
- `AddItemDialog` — exists as rapid-capture dialog
- `ProfilePage` — shows display name and active/purchased counts
- `BudgetPage` — provides budget form and free money metric
- `SuggestionsPage` — uses current budget and wishlist to suggest purchases
- `Onboarding` — multi-step flow with income and fixed cost capture

## Component Gaps vs. Listi Brief
- No dedicated `PaydayScreen` with allocation engine and buy/defer result lists
- No full `FixedExpenseManager` with savings line item and recurring categories
- No item detail/edit page beyond card actions
- No allocation history page
- No rich profile card with zodiac, hobbies, and personality data
- No purchase celebration/animation component

## Notes
This component map should be used as the source of truth for design and implementation planning. Existing code can be refactored into these module names as the app expands toward a full MVP.
