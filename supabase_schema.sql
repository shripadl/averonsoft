-- AveronSoft Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (user metadata)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Short URLs table
CREATE TABLE IF NOT EXISTS short_urls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Short URL clicks tracking
CREATE TABLE IF NOT EXISTS short_url_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_url_id UUID NOT NULL REFERENCES short_urls(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  device_type TEXT
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  collection_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmark collections table
CREATE TABLE IF NOT EXISTS bookmark_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for bookmarks collection
ALTER TABLE bookmarks
ADD CONSTRAINT fk_collection
FOREIGN KEY (collection_id)
REFERENCES bookmark_collections(id)
ON DELETE SET NULL;

-- Business cards table
CREATE TABLE IF NOT EXISTS business_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  avatar_url TEXT,
  qr_code_url TEXT,
  template TEXT DEFAULT 'default',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business card views tracking
CREATE TABLE IF NOT EXISTS business_card_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT
);

-- Abuse reports table
CREATE TABLE IF NOT EXISTS abuse_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_email TEXT,
  resource_type TEXT NOT NULL, -- 'short_url', 'bookmark', 'business_card'
  resource_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Subscription status table (synced from Paddle)
CREATE TABLE IF NOT EXISTS subscription_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paddle_subscription_id TEXT UNIQUE,
  paddle_customer_id TEXT,
  product_type TEXT NOT NULL, -- 'shortener_pro', 'bookmarks_pro', 'business_card_pro', 'suite_bundle'
  status TEXT NOT NULL, -- 'active', 'paused', 'cancelled', 'expired'
  billing_cycle TEXT, -- 'monthly', 'annual'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs table (optional)
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_short_urls_user_id ON short_urls(user_id);
CREATE INDEX idx_short_urls_short_code ON short_urls(short_code);
CREATE INDEX idx_short_url_clicks_short_url_id ON short_url_clicks(short_url_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_collection_id ON bookmarks(collection_id);
CREATE INDEX idx_bookmark_collections_user_id ON bookmark_collections(user_id);
CREATE INDEX idx_business_cards_user_id ON business_cards(user_id);
CREATE INDEX idx_business_cards_slug ON business_cards(slug);
CREATE INDEX idx_business_card_views_card_id ON business_card_views(card_id);
CREATE INDEX idx_subscription_status_user_id ON subscription_status(user_id);
CREATE INDEX idx_subscription_status_paddle_subscription_id ON subscription_status(paddle_subscription_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_url_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_card_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE abuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for short_urls
CREATE POLICY "Users can view their own short URLs"
  ON short_urls FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create short URLs"
  ON short_urls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own short URLs"
  ON short_urls FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own short URLs"
  ON short_urls FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for short_url_clicks (read-only for owners)
CREATE POLICY "Users can view clicks on their short URLs"
  ON short_url_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM short_urls
      WHERE short_urls.id = short_url_clicks.short_url_id
      AND short_urls.user_id = auth.uid()
    )
  );

-- RLS Policies for bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for bookmark_collections
CREATE POLICY "Users can view their own collections"
  ON bookmark_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public collections are viewable by everyone"
  ON bookmark_collections FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can create collections"
  ON bookmark_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON bookmark_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON bookmark_collections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for business_cards
CREATE POLICY "Users can view their own business cards"
  ON business_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Active business cards are publicly viewable"
  ON business_cards FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Users can create business cards"
  ON business_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business cards"
  ON business_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business cards"
  ON business_cards FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for business_card_views (read-only for owners)
CREATE POLICY "Users can view analytics for their business cards"
  ON business_card_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_cards
      WHERE business_cards.id = business_card_views.card_id
      AND business_cards.user_id = auth.uid()
    )
  );

-- RLS Policies for abuse_reports (anyone can create, only admins can view)
CREATE POLICY "Anyone can create abuse reports"
  ON abuse_reports FOR INSERT
  WITH CHECK (TRUE);

-- RLS Policies for subscription_status
CREATE POLICY "Users can view their own subscription status"
  ON subscription_status FOR SELECT
  USING (auth.uid() = user_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default admin settings
INSERT INTO admin_settings (key, value) VALUES
  ('contact_email', '"slimaye2026@gmail.com"'::jsonb),
  ('pricing_shortener_monthly', '15'::jsonb),
  ('pricing_shortener_annual', '150'::jsonb),
  ('pricing_bookmarks_monthly', '9'::jsonb),
  ('pricing_bookmarks_annual', '90'::jsonb),
  ('pricing_business_card_monthly', '6'::jsonb),
  ('pricing_business_card_annual', '60'::jsonb),
  ('pricing_suite_monthly', '25'::jsonb),
  ('pricing_suite_annual', '250'::jsonb)
ON CONFLICT (key) DO NOTHING;
