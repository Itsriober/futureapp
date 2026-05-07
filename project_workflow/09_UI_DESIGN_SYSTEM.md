# 09 UI DESIGN SYSTEM

## Visual Direction
- Inspired by Glide, Locket, and Spotify Wrapped
- Bold headings, clean body text, and vibrant category colors
- Dark-mode-first aesthetic with rich accent tones
- Cards should feel tactile, image-forward, and aspirational
- Microinteractions should feel satisfying and playful

## Typography
- Headings: bold display style with strong weight
- Body: clean sans-serif text with good readability
- Use a consistent scale for h1/h2/h3 and body sizes
- Keep contrast high for text over background cards

## Color System
- `primary`: warm accent for key actions and active states
- `background`: soft dark/neutral background
- `card`: elevated surfaces with subtle border and shadow
- `muted`: secondary text and borders
- Category colors:
  - Buy: `amber` / gold
  - Eat: `orange`
  - Go: `cyan`
  - Grow: `emerald`
  - Home: `violet`
  - Experience: `rose`

## Component Patterns
- Cards: rounded-3xl, soft shadow, subtle hover lift
- Buttons: rounded-full for primary actions, outlined for secondary
- Dialogs: floating, glass-like background, strong close affordance
- Filters: pill chips with clear active state
- Forms: compact controls and instant feedback

## Interaction Guidelines
- Add item flow must be fast and low friction
- Important actions should animate gently but clearly
- Purchase and allocation events should feel rewarding
- Avoid clutter on the wishlist board; keep it image/emoji-forward

## Accessibility
- Maintain 4.5:1 contrast for interactive text and controls
- Ensure buttons and chips have at least 44x44 tap targets
- Use semantic HTML for forms and navigation
- Support keyboard focus states and screen reader labels

## Notes
The UI system should make the app feel more like an aspirational mood board than a finance app. `WishlistCard`, `ProfileCard`, and `AllocationSummary` are the primary visual components for that experience.
