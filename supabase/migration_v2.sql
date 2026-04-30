-- LinkedIn Content Pipeline — V2 Migration

-- Add avatar to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Drop old constraints before updating data
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_format_check;

-- Migrate existing status values to new set
UPDATE posts SET status = 'ideation'        WHERE status IN ('idea', 'drafting', 'ready');
UPDATE posts SET status = 'analytics_added' WHERE status = 'analytics_updated';
-- 'scheduled', 'live', 'archived' remain unchanged

-- Add new columns
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS full_post_content TEXT,
  ADD COLUMN IF NOT EXISTS excerpt           TEXT,
  ADD COLUMN IF NOT EXISTS inspiration_notes TEXT,
  ADD COLUMN IF NOT EXISTS posting_day       TEXT,
  ADD COLUMN IF NOT EXISTS posting_date      DATE,
  ADD COLUMN IF NOT EXISTS internal_title    TEXT,
  ADD COLUMN IF NOT EXISTS asset_format      TEXT,
  ADD COLUMN IF NOT EXISTS asset_name        TEXT;

-- Backfill from old columns
UPDATE posts SET posting_date   = COALESCE(live_date, scheduled_date) WHERE posting_date   IS NULL;
UPDATE posts SET internal_title = COALESCE(memory_hook, title)        WHERE internal_title IS NULL;
UPDATE posts SET asset_format   = format                               WHERE asset_format   IS NULL AND format IS NOT NULL;

-- New constraints
ALTER TABLE posts ADD CONSTRAINT posts_status_check
  CHECK (status IN ('ideation', 'scheduled', 'live', 'analytics_added', 'archived'));

ALTER TABLE posts ADD CONSTRAINT posts_asset_format_check
  CHECK (asset_format IN ('text', 'image', 'video', 'carousel', 'poll', 'document', 'repost') OR asset_format IS NULL);

ALTER TABLE posts ADD CONSTRAINT posts_posting_day_check
  CHECK (posting_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') OR posting_day IS NULL);
