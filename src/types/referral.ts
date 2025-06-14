export interface Referral {
  id: string
  referrer_user_id: string
  referred_email: string
  referral_code: string
  referred_user_id?: string
  status: "pending" | "signed_up" | "activated" | "rewarded" | "expired"
  reward_type: string
  reward_amount: number
  reward_status: "pending" | "earned" | "paid" | "cancelled"
  signup_date?: string
  activation_date?: string
  reward_date?: string
  expires_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  referred_user?: any
}

export interface ReferralCampaign {
  id: string
  organization_id: string
  name: string
  description?: string
  is_active: boolean
  reward_config: Record<string, any>
  terms_and_conditions?: string
  max_referrals_per_user: number
  referral_expiry_days: number
  minimum_activation_criteria: Record<string, any>
  tracking_settings: Record<string, any>
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ReferralReward {
  id: string
  referral_id: string
  referrer_user_id: string
  reward_type: string
  amount: number
  currency: string
  status: "pending" | "approved" | "paid" | "cancelled"
  payout_method?: string
  payout_details: Record<string, any>
  processed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ReferralStats {
  total_referrals: number
  successful_referrals: number
  pending_referrals: number
  total_rewards_earned: number
  total_rewards_paid: number
  conversion_rate: number
}
