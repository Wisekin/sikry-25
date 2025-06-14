import { NextResponse } from 'next/server';

interface ApiRewardTier {
  tier_id: string;
  name: string;
  description: string;
  reward_for_referrer_display: string;
  reward_for_referee_display: string;
  conditions: string[];
}

interface ApiFAQItem {
  question: string;
  answer: string;
}

interface RewardsProgramDetailsApiResponse {
  program_name: string;
  how_it_works_summary: string;
  reward_tiers: ApiRewardTier[];
  eligibility_notes: string[];
  claim_process_info: string;
  faq: ApiFAQItem[];
}

const mockRewardsProgramData: RewardsProgramDetailsApiResponse = {
  program_name: "Our Awesome Referral Program",
  how_it_works_summary: "Invite your friends to join us! When they sign up and make their first qualifying action (like a purchase or subscription), you both get rewarded. It's a win-win!",
  reward_tiers: [
    {
      tier_id: 'tier_standard_cash',
      name: 'Standard Cash Reward',
      description: 'For each friend who signs up for a paid plan and remains a customer for 30 days.',
      reward_for_referrer_display: '$50 USD Account Credit',
      reward_for_referee_display: '$25 USD Discount on first order',
      conditions: [
        "Referred friend must be a new customer to OurPlatform.",
        "Referred friend must subscribe to any of our paid plans.",
        "Referred friend must complete their first successful billing cycle (if applicable to the plan).",
        "The unique referral link provided must be used during the signup process."
      ]
    },
    {
      tier_id: 'tier_enterprise_bonus',
      name: 'Enterprise Client Bonus',
      description: 'If your referred friend signs up for an Enterprise level plan with an annual commitment.',
      reward_for_referrer_display: '$200 USD Bonus Account Credit',
      reward_for_referee_display: '10% off first year of their Enterprise plan subscription',
      conditions: [
        "All Standard Reward conditions must be met.",
        "Referred friend must sign an annual Enterprise contract and complete initial payment.",
      ]
    }
  ],
  eligibility_notes: [
    "This referral program is available to all active, registered users of OurPlatform.",
    "Rewards are subject to verification by OurPlatform team and may be adjusted or revoked if any fraudulent activity or abuse of the program is detected.",
    "Self-referrals (signing up yourself using your own referral link) are not permitted and will not qualify for rewards.",
    "The terms and conditions of this referral program may be updated by OurPlatform at any time without prior notice."
  ],
  claim_process_info: "Referrer rewards (account credits) are typically applied to your OurPlatform account within 7-10 business days after your referred friend successfully meets all eligibility criteria. You will be notified via email. Referee discounts are applied automatically at their first checkout when using the referral link, or as specified in their welcome offer.",
  faq: [
    { question: "How many friends can I refer?", answer: "There is currently no limit! The more friends you successfully refer according to the program terms, the more rewards you can accumulate." },
    { question: "When will I see my reward credit on my account?", answer: "Account credits for referrers are usually processed and applied within 7-10 business days after your referred friend has met all the necessary conditions (e.g., completed their first billing cycle)." },
    { question: "Can I refer someone who has used OurPlatform in the past?", answer: "No, the referral program is specifically designed to reward users for bringing new customers to OurPlatform." },
    { question: "What happens if my friend forgets to use my referral link during signup?", answer: "Unfortunately, for the referral to be tracked and for both parties to be eligible for rewards, the unique referral link must be used at the time of signup. We cannot manually apply referral credits afterwards." },
    { question: "Are the rewards taxable?", answer: "You are responsible for any tax implications of the rewards received. Please consult with a tax advisor if you have questions." }
  ]
};

export async function GET(request: Request) {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    return NextResponse.json({ data: mockRewardsProgramData }); // Wrapped response
  } catch (error) {
    console.error("Error fetching rewards program details:", error);
    return NextResponse.json({ error: { message: "Error fetching rewards program details" } }, { status: 500 });
  }
}
