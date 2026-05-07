# AGENT INSTRUCTIONS

## Code Discipline
- Use TypeScript with strict typing
- Keep components small and reusable
- Favor declarative logic over imperative DOM manipulation
- Keep CSS in Tailwind utility classes and component-specific styles only

## Naming Conventions
- Pages use `PascalCase` and map to route files
- Components use descriptive names like `WishlistCard`, `AllocationSummary`
- Hooks use `use` prefix, e.g. `useAuth`, `useBudget`
- API helpers use explicit naming such as `fetchProfile`, `upsertBudget`

## Architecture Rules
- Auth-protected data must only be fetched after verifying the user session
- Keep Supabase queries scoped to `user_id`
- Separate UI state from persisted data state
- Use local caching or storage only for instant UX, not as the source of truth

## Security
- Never expose service role keys in the frontend
- Use RLS rules on all tables to enforce `auth.uid()` ownership
- Disable public write access to any authenticated table
- Validate user input before sending it to Supabase

## PR Guidance
- One feature or fix per pull request
- Reference the relevant spec doc in the PR description
- Include a short summary of what changed and why
- If a route or page is incomplete, mark it clearly and gate navigation until it is finished

## Developer Notes
- Use `GITHUB_PROJECT_TASKS.md` and `07_IMPLEMENTATION_PLAN.md` as the source of truth for priorities
- Updates to the app should preserve the aspirational mood-board experience from the Listi brief
- Avoid scope creep: deliver the wishlist allocator as a beautiful, private, single-user product
