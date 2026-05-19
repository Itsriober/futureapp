-- User's post-purchase rating: 'worth_it' | 'regret' | null (not yet rated)
alter table cycle_allocations
  add column if not exists satisfaction text check (satisfaction in ('worth_it', 'regret'));
