-- Add target_date to wishlist_items
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS target_date DATE NULL;

-- Add streak to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0;
