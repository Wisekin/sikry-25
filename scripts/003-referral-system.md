-- Referral Mechanism Tables
-- Following principle: New tables only, no changes to existing schema

-- Track referral relationships and rewards
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_email VARCHAR(255) NOT NULL,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'activated', 'rewarded', 'expired')),
    reward_type VARCHAR(50) DEFAULT 'credits',
    reward_amount DECIMAL(10,2) DEFAULT 0,
    reward_status VARCHAR(20) DEFAULT 'pending' CHECK (reward_status IN ('pending', 'earned', 'paid', 'cancelled')),
    signup_date TIMESTAMP,
    activation_date TIMESTAMP,
    reward_date TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Track referral campaigns and settings
CREATE TABLE referral_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    reward_config JSONB NOT NULL, -- Reward structure and rules
    terms_and_conditions TEXT,
    max_referrals_per_user INTEGER DEFAULT 100,
    referral_expiry_days INTEGER DEFAULT 30,
    minimum_activation_criteria JSONB DEFAULT '{}',
    tracking_settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Track referral rewards and payouts
CREATE TABLE referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    payout_method VARCHAR(50),
    payout_details JSONB DEFAULT '{}',
    processed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_email ON referrals(referred_email);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referral_campaigns_org_active ON referral_campaigns(organization_id, is_active);
CREATE INDEX idx_referral_rewards_referrer ON referral_rewards(referrer_user_id);
CREATE INDEX idx_referral_rewards_status ON referral_rewards(status);

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code(user_id_param UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    code VARCHAR(50);
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generate code based on user ID and random string
        code := UPPER(SUBSTRING(user_id_param::TEXT FROM 1 FOR 8) || 
                     SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
        
        -- Check if code already exists
        IF NOT EXISTS (SELECT 1 FROM referrals WHERE referral_code = code) THEN
            RETURN code;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique referral code after 100 attempts';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
