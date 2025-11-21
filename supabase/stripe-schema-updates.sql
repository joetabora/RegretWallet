-- Add payment tracking fields to bets table
ALTER TABLE bets 
ADD COLUMN IF NOT EXISTS checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_id TEXT,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS transfer_id TEXT,
ADD COLUMN IF NOT EXISTS donation_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS escrow_captured_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for payment tracking
CREATE INDEX IF NOT EXISTS idx_bets_checkout_session_id ON bets(checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_bets_refund_id ON bets(refund_id);
CREATE INDEX IF NOT EXISTS idx_bets_transfer_id ON bets(transfer_id);

-- Update anti_charities to ensure stripe_account_id is available
-- (Already exists in schema-updates.sql, but ensuring it's there)

