-- Add new columns to bets table for onboarding wizard
ALTER TABLE bets 
ADD COLUMN IF NOT EXISTS duration_weeks INTEGER,
ADD COLUMN IF NOT EXISTS proof_method TEXT, -- 'referee' or 'honor'
ADD COLUMN IF NOT EXISTS anti_charity_id UUID REFERENCES charities(id) ON DELETE RESTRICT,
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS draft_data JSONB; -- Store incomplete wizard data

-- Make charity_id nullable for drafts (will be set when finalized)
ALTER TABLE bets 
ALTER COLUMN charity_id DROP NOT NULL;

-- Create bet templates table
CREATE TABLE IF NOT EXISTS bet_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'fitness', 'health', 'productivity', 'social', etc.
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create anti_charities table (charities you don't want to support)
CREATE TABLE IF NOT EXISTS anti_charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  meme_url TEXT, -- URL to meme/image
  hate_score INTEGER DEFAULT 0, -- 0-100 scale
  category TEXT,
  stripe_account_id TEXT,
  website_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE bet_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE anti_charities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bet_templates (public read)
CREATE POLICY "Anyone can view bet templates"
    ON bet_templates FOR SELECT
    USING (true);

-- RLS Policies for anti_charities (public read)
CREATE POLICY "Anyone can view active anti_charities"
    ON anti_charities FOR SELECT
    USING (is_active = true);

