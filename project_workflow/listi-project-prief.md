LISTI — Complete Project Brief 
Project Identity 
Product Name: Listi (working title — open to refinement)  
Product Type: Personal finance + lifestyle wishlist management web application  
Target Platform: Web-first (React SPA), designed for seamless migration to React Native / Expo 
Owner: Harmon (Illustriober Creatives)  
Primary Audience: Young urban professionals in Nairobi and similar African markets aged 20–35, 
earning a monthly salary, who struggle with mid-month impulse cataloguing and end-of-month 
spending paralysis 
 
Problem Statement 
The user receives a monthly salary. Throughout the month, they encounter things they want — 
shoes on the street, a restaurant they pass, a course they want to take, an event they want to 
attend. They mentally or informally note these, promising themselves they will act at month end. By 
payday, the list has grown unmanageably large, the salary cannot accommodate everything, and 
the user either spends impulsively, freezes entirely, or burns through money in three days with 
regret. There is no system mediating between desire capture and financial reality. 
Existing budgeting apps (YNAB, Wallet, M-Pesa summaries) address what was spent. None address 
what should be spent next, from a ranked queue of personal desires, within actual budget 
constraints. 
 
Product Vision 
Listi is a forward-looking personal lifestyle budget allocator disguised as a beautiful wishlist 
experience. The user captures anything they want across their life — things, places, food, 
experiences, upgrades — at any moment. On payday, they enter their salary, the system deducts 
fixed obligations, and from the remaining discretionary balance it tells them exactly which wishlist 
items to act on this month, based on priority and time-on-list scoring. Items not funded this month 
roll over with increasing priority. Over time, the user buys everything they actually care about, in an 
order that doesn't leave them broke. 
The secondary goal — and this is equally important — is that Listi must be so visually compelling 
that users return daily just to browse their wishlist. It should feel like a personal mood board of your 
future life, not a spreadsheet. The visual experience is a core product feature, not decoration. 
 
Core Features 
1. Authentication and Rich User Profile 
Users register with email or Google OAuth. On first login, an onboarding flow (multi-step, not a 
single form) collects: 
• Full name and profile photo or avatar 
• Date of birth (used to auto-calculate and display zodiac sign with badge) 
• Personality type (MBTI, self-selected from a list) 
• Hobbies (multi-select with icons — travel, cooking, gaming, fitness, reading, music, etc.) 
• Favorite food, favorite music genre, favorite color 
• City / location 
• Short personal bio 
• Monthly take-home income (used by the allocation engine) 
The profile renders as a rich visual card — think Spotify Wrapped aesthetics. Zodiac badge, hobby 
chips, personality tag, favorite color accent, everything visible at a glance. This profile is personal 
and private. No social features at MVP. 
 
2. Wishlist System — Extended Item Types 
A wishlist item is not limited to physical products. Categories: 
• Buy — Physical products, gadgets, clothing, accessories 
• Eat — Restaurants to try, dishes, cafes, food experiences 
• Go — Events, clubs, weddings, trips, places to visit 
• Grow — Courses, books, certifications, skills 
• Home — Furniture, appliances, home improvements 
• Experience — Concerts, spa, sports events, activities 
Each item has: 
• Name 
• Estimated cost (in KES or user's local currency) 
• Category (from the above list) 
• Priority score (1–5, user-set at entry time, editable at any time) 
• Optional notes 
• Optional image (uploaded or URL) 
• Optional emoji (if no image) 
• Date added (system-set, used in scoring algorithm) 
• Status: Active (in queue), Purchased (done), Deferred (explicitly skipped), Archived 
Users can return at any time to edit priority, change estimated cost, update notes, or archive 
something they no longer want. 
 
3. Fixed Obligations Manager 
A separate section where the user enters recurring monthly commitments: 
• Rent 
• Electricity 
• Water 
• Internet / airtime 
• Subscriptions (Netflix, Spotify, gym, etc.) 
• Savings contribution (enforced as non-negotiable before allocation) 
• Any other recurring deduction 
These are entered once and persist. On payday, they are auto-deducted before the discretionary 
balance is calculated. 
 
4. Payday Allocation Engine 
The core functional feature: 
1. User taps "It's Payday" 
2. Enters or confirms salary amount 
3. System deducts all fixed obligations 
4. Locks a savings amount (if configured) 
5. Shows remaining discretionary balance 
6. Runs allocation algorithm against active wishlist: 
Score = (Priority × 2) + (Weeks on list × 0.5) 
Sort by Score descending 
Allocate greedily until balance runs out 
7. Outputs two lists:  
o Buy This Month — Items funded within the balance 
o Next Month — Everything deferred, with projected funding month if priority holds 
Deferred items roll over. Their score increases each month they are not funded, so even low-priority 
items eventually get funded. The user can override — promote an item, demote, or skip it for this 
cycle. 
After allocation, user can mark items as purchased individually. This triggers a small satisfying 
animation (confetti, checkmark — something rewarding). 
 
5. Wishlist Visual Board 
The primary screen users return to daily: 
• Scrollable card grid (masonry or responsive grid layout) 
• Each card shows: emoji or image, name, cost, category color, priority indicator 
• Filter by category (Buy, Eat, Go, Grow, Home, Experience) 
• Sort by priority, cost (ascending/descending), date added 
• "Dream Board" feel — not a list, not a table 
• Cards animate on scroll (subtle entrance) 
• Tapping a card opens a detail view with full info and edit options 
This screen should be beautiful enough that users open the app just to scroll through it. 
 
6. Allocation History 
A log of past payday cycles: 
• Month, salary entered, total deductions, discretionary balance 
• Items allocated that month 
• Items purchased vs. deferred 
• Simple visual summary per cycle 
This builds a personal spending history over time. 
 
Tech Stack 
Frontend (Web) 
• React + Vite — Not Next.js. Pure SPA for maximum React Native migration compatibility 
• TypeScript — Strict mode 
• Tailwind CSS — Core utility classes only 
• Zustand — Client state (auth session, UI state) 
• TanStack Query — Server state, data fetching 
• Framer Motion — Animations and card transitions 
• React Router v6 — Client-side routing 
Backend 
• Supabase — Handles auth (email + Google OAuth), PostgreSQL database, file storage 
(wishlist item images), Row Level Security 
• No separate Express backend at MVP. Supabase's auto-generated REST API and RLS 
policies replace the API layer entirely 
• If complexity grows, an Edge Function layer (Deno) can be added within Supabase without a 
separate VPS 
Mobile (Future Phase) 
• Expo + React Native — Direct migration from React + Vite 
• NativeWind — Tailwind for React Native 
• Zustand and TanStack Query carry over unchanged 
• Supabase JS SDK works identically in React Native 
Hosting 
• Vercel — Frontend deployment 
• Supabase — Managed backend (no VPS needed at this scale) 
Why This Stack Over Your Usual Express/Prisma Setup 
The Supabase choice eliminates backend deployment overhead for a personal-scale app. The auth, 
database, file storage, and row-level security are all managed. When you migrate to React Native, 
the Supabase JS client works identically — no backend rewrite. The frontend React code migrates 
at 80–90% fidelity to React Native with Expo. 
 
Design Direction 
• Reference aesthetic: Glide app (icon clarity, visual recognition at a glance) + Locket 
(intimate, personal) + Spotify Wrapped (bold, celebratory) 
• Typography: Bold headings, clean body text — Inter or Plus Jakarta Sans 
• Color System: Vibrant category colors per wishlist type (each category has a distinct color 
identity), dark-mode-first or rich light mode 
• Cards: Large, image/emoji-forward, readable at a glance 
• Interactions: Satisfying microanimations — card flip on purchase, confetti on allocation, 
smooth scroll 
• Icons/Emoji: Heavy use of emoji as visual shorthand for categories and items 
• Mobile-first layout: Bottom navigation bar for mobile, sidebar for desktop 
• Fully responsive across mobile, tablet, desktop 
 
User Roles 
At MVP, there is one role: Authenticated User. All data is private and scoped to the individual user 
via Supabase Row Level Security. No admin role, no social features, no shared lists at this stage. 
 
Application Screens (Page Map) 
Unauthenticated: 
• Landing / Marketing page (/) 
• Login (/login) 
• Register (/register) 
• Onboarding flow (/onboarding — multi-step, post-registration) 
Authenticated: 
• Home / Dashboard (/dashboard) — Balance snapshot, allocation status, highlighted 
wishlist items 
• Wishlist Board (/wishlist) — Full scrollable card grid with filters 
• Add Item (/wishlist/add) — Form to add new wishlist item 
• Item Detail (/wishlist/:id) — Full item view with edit and priority controls 
• Fixed Expenses (/expenses) — Manage recurring monthly obligations 
• Payday Screen (/payday) — Salary input, allocation result, buy/defer lists 
• Allocation History (/history) — Past payday cycles 
• Profile (/profile) — Rich personal profile card, edit options 
• Settings (/settings) — Account, notifications, currency preference 
 
Development Phases 
Phase 0 — Foundation (Week 1–2) Supabase project setup, database schema, auth configuration, 
React + Vite scaffold, Vercel deployment, Tailwind configuration, design token setup 
Phase 1 — Core Experience (Week 3–5) Auth flow, onboarding, profile screen, wishlist CRUD, 
category system, wishlist visual board 
Phase 2 — Allocation Engine (Week 6–7) Fixed expenses manager, payday screen, allocation 
algorithm, purchase marking, rollover logic 
Phase 3 — Polish + History (Week 8–9) Allocation history, animations and microinteractions, 
responsive design QA, PWA setup (installable on mobile), performance optimization 
Phase 4 — Mobile Migration (Future) Expo scaffold, component migration, native gesture 
handling, app store preparation 
 
Third-Party Services 
Service Purpose Tier 
Supabase Auth, database, file storage, RLS Free tier sufficient for MVP 
Vercel Frontend hosting, CI/CD Free tier 
Google OAuth  Social login Free 
No payment processing, no email service (Supabase handles auth emails), no CDN needed beyond 
Vercel's default. 
 
Environment Variables 
VITE_SUPABASE_URL= 
VITE_SUPABASE_ANON_KEY= 
That is the entire env config for MVP. Supabase handles everything server-side. 
 
Database Schema (Supabase / PostgreSQL) 
users — Extended profile (linked to Supabase auth.users via id) Fields: id, full_name, avatar_url, 
date_of_birth, zodiac_sign, mbti_type, hobbies (jsonb), favorite_food, favorite_music, 
favorite_color, city, bio, monthly_income, currency, created_at, updated_at 
wishlist_items Fields: id, user_id (fk), name, estimated_cost, category (enum), priority (1–5), notes, 
image_url, emoji, status (enum: active, purchased, deferred, archived), created_at, updated_at 
fixed_expenses Fields: id, user_id (fk), name, amount, frequency (monthly), is_savings, created_at, 
updated_at 
payday_cycles Fields: id, user_id (fk), cycle_month, salary_amount, total_deductions, 
savings_amount, discretionary_balance, created_at 
cycle_allocations Fields: id, cycle_id (fk), wishlist_item_id (fk), status (allocated, purchased, 
deferred), allocated_at, purchased_at 
Row Level Security enforced on all tables: every query automatically scoped to auth.uid(). 
 
Product Manager Recommendations 
This section is written from the perspective of a senior PM reviewing Listi as a product brief. These 
are observations, gaps, and recommendations that the product should address before or shortly 
after MVP. 
 
1. The Real Value Proposition Needs Sharpening 
The app solves two problems simultaneously — desire capture and budget allocation — but they 
are in tension with each other emotionally. Desire capture should feel aspirational and fun. Budget 
allocation feels constraining. The UX must keep these two modes emotionally distinct. The wishlist 
board should feel like Pinterest, not a bank statement. The payday screen can feel more 
disciplined, but it should still be framed as "here is what you've earned the right to buy this month" 
not "here is what you can't afford." Copywriting across the app matters enormously here. 
2. The Onboarding Drop-Off Risk Is High 
A multi-step profile onboarding with zodiac, MBTI, hobbies, favorite food, etc. is charming in 
concept but will cause significant drop-off if it feels like homework. Recommendation: make every 
field optional except name and income. Show the profile card building in real time as they fill it in. 
Let them see it populate. The reward (seeing your beautiful profile card) must come before the 
effort is complete, not after. 
3. The Allocation Algorithm Needs a User Mental Model 
Users need to understand intuitively why item A was funded and item B was not. If the algorithm 
just outputs a list without explanation, users will distrust it. Recommendation: for each item in the 
"Buy This Month" list, show a brief tag like "High priority" or "Waited 6 weeks." For deferred items, 
show "Projected next month if priority holds." This transparency builds trust in the system. 
4. Friction at Item Entry Must Be Near Zero 
If it takes more than 15 seconds to add a wishlist item, users will not do it mid-street when they see 
that shoe. Recommendation: the add item flow must be a floating action button accessible from 
any screen, opening a bottom sheet with just three required fields — name, cost, category. 
Everything else (priority, notes, image) is optional and editable later. The initial capture must be 
instant. 
5. The "Purchase" Moment Is a Retention Mechanism 
When a user marks an item as purchased, that is the highest emotional moment in the product. It 
must be celebrated. Confetti, a brief congratulations message, something that makes the user feel 
good about the decision they made. This positive reinforcement is what creates the habit loop — 
users will want to come back and experience that moment again. 
6. Progressive Disclosure on the Payday Screen 
The first time a user hits the payday screen, seeing a complex allocation output may overwhelm 
them. Recommendation: animate the result in stages. First show the salary. Then deduct fixed 
expenses one by one with a counter. Then show the discretionary balance with a brief pause. Then 
reveal the wishlist items one by one. This theatrical reveal makes the payday moment feel 
rewarding, not clinical. 
7. Currency and Locale Support 
The first users are in Nairobi. KES should be the default currency. But the architecture should 
support multi-currency from day one (store currency preference in profile, format all amounts 
accordingly). Adding EUR, USD, UGX, TZS later should require zero schema changes. 
8. PWA Configuration Is High Priority 
This app is built for mobile usage — capturing wishlist items on the go — but it launches as a web 
app. A well-configured PWA (installable, offline-capable for browsing the wishlist without internet, 
push notifications for payday reminders) closes most of the gap between web and native without 
the app store overhead. This should be Phase 3, not post-launch. 
9. Payday Reminders 
Users need a nudge to open the payday screen on salary day. Without a reminder, they will forget 
the tool exists precisely when it is most valuable. PWA push notifications or email reminders (via 
Supabase auth email) on a user-configured payday date is a simple, high-impact feature. Ask for 
payday date during onboarding. 
10. The Wishlist Should Support Images Prominently 
The visual experience depends on image richness. Many users will not upload images manually. 
Recommendation: integrate an image search or URL import — user pastes a product URL or image 
URL and the card auto-populates the image. Even better, integrate with a simple image search API 
so users can search for an image for their item. This dramatically improves the visual quality of the 
board without requiring manual uploads. 
11. "Surprise Me" Allocation Mode 
An advanced optional feature: instead of the algorithm determining allocation, the user shakes the 
screen or taps "Surprise Me" and the system randomly promotes a low-priority item to this month's 
buy list. This is a delight feature that adds playfulness and occasionally surfaces forgotten wishlist 
items the user is excited to rediscover. 
12. Annual Wrap-Up 
At year end (or account anniversary), generate a Spotify Wrapped-style summary: total items 
purchased, total spent, categories most bought from, biggest single purchase, items still waiting. 
This is shareable (screenshot-friendly card) and creates organic social virality without building a 
social network. 
13. What This Product Is Not (Scope Boundaries) 
To prevent scope creep, the following are explicitly out of scope for MVP and Phase 2: social 
features (shared wishlists, following other users), investment tracking, debt management, bill 
splitting, group expenses, merchant integrations, affiliate links. The product does one thing — 
personal wishlist budgeting — and does it beautifully. 
14. Naming 
"Listi" is functional but generic. Consider names that evoke the aspirational and financial dual 
nature: Unayo (Swahili: "what you have"), Baadaye (Swahili: "later / future"), Tamaa (Swahili: 
"desire"), or English-adjacent names like Slate, Crave, Intend, Earned. Name should be available as 
a .com or .app domain and easy to say in conversation.