-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  total_signups INTEGER DEFAULT 0,
  total_bets INTEGER DEFAULT 0,
  rewards DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral usage tracking
CREATE TABLE IF NOT EXISTS referral_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referral_code, user_id)
);

-- Group challenges table
CREATE TABLE IF NOT EXISTS group_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  target_amount DECIMAL(10, 2) NOT NULL,
  duration_weeks INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES group_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_bets INTEGER DEFAULT 0,
  total_donated DECIMAL(10, 2) DEFAULT 0,
  UNIQUE(challenge_id, user_id)
);

-- Challenge bets (link bets to challenges)
CREATE TABLE IF NOT EXISTS challenge_bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES group_challenges(id) ON DELETE CASCADE,
  bet_id UUID NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, bet_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_usage_code ON referral_usage(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_usage_user_id ON referral_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_group_challenges_status ON group_challenges(status);
CREATE INDEX IF NOT EXISTS idx_group_challenges_created_by ON group_challenges(created_by);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_bets_challenge_id ON challenge_bets(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_bets_bet_id ON challenge_bets(bet_id);

-- Triggers for updated_at
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_challenges_updated_at BEFORE UPDATE ON group_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_bets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals"
    ON referrals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = referrals.referrer_id
            AND users.clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- RLS Policies for referral_usage (public read for validation)
CREATE POLICY "Anyone can view referral usage"
    ON referral_usage FOR SELECT
    USING (true);

-- RLS Policies for group_challenges (public read, users can create)
CREATE POLICY "Anyone can view active challenges"
    ON group_challenges FOR SELECT
    USING (true);

-- RLS Policies for challenge_participants (users can view and join)
CREATE POLICY "Anyone can view challenge participants"
    ON challenge_participants FOR SELECT
    USING (true);

-- RLS Policies for challenge_bets (public read)
CREATE POLICY "Anyone can view challenge bets"
    ON challenge_bets FOR SELECT
    USING (true);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    code TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..8 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

