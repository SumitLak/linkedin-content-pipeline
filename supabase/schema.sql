-- PostTrace Database Schema

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed profiles
INSERT INTO profiles (name) VALUES ('Sumit Lakhina'), ('Sumit A');

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_context TEXT CHECK (brand_context IN ('UKAT', 'SEO', 'AI', 'Leadership', 'Kindness', 'Marketing', 'Personal Growth', 'Other')),
  title TEXT,
  memory_hook TEXT,
  theme TEXT,
  content_pillar TEXT,
  format TEXT CHECK (format IN ('text', 'image', 'video', 'carousel', 'poll', 'repost', 'document')),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'drafting', 'ready', 'scheduled', 'live', 'analytics_updated', 'archived')),
  scheduled_date DATE,
  live_date DATE,
  linkedin_url TEXT,
  inspiration_post_url TEXT,
  inspiration_source_name TEXT,
  inspiration_note TEXT,
  caption TEXT,
  full_post TEXT,
  cta TEXT,
  hashtags TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Media table
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  analytics_date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  members_reached INTEGER DEFAULT 0,
  reactions INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  sends INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  total_engagements INTEGER GENERATED ALWAYS AS (reactions + comments + reposts + saves + sends) STORED,
  engagement_rate NUMERIC(6,3) GENERATED ALWAYS AS (
    CASE WHEN impressions > 0
      THEN ((reactions + comments + reposts + saves + sends)::numeric / impressions) * 100
      ELSE 0
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_posts_profile ON posts(profile_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_date);
CREATE INDEX idx_posts_live ON posts(live_date);
CREATE INDEX idx_media_post ON media(post_id);
CREATE INDEX idx_analytics_post ON analytics(post_id);
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(memory_hook,'') || ' ' || coalesce(caption,'') || ' ' || coalesce(theme,'')));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS policies (open for now, auth can be added later)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on posts" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on media" ON media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on analytics" ON analytics FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Allow public read on post-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-media');

CREATE POLICY "Allow authenticated upload on post-media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-media');

CREATE POLICY "Allow authenticated delete on post-media" ON storage.objects
  FOR DELETE USING (bucket_id = 'post-media');
