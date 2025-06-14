export const ORGANIZATION_TIERS = {
  FREE: {
    name: 'Free',
    maxUsers: 5,
    maxStorage: 1, // GB
    maxRequests: 1000, // per month
    features: [
      'Basic Analytics',
      'Standard Support',
      'Basic Security Features'
    ]
  },
  PRO: {
    name: 'Pro',
    maxUsers: 20,
    maxStorage: 10, // GB
    maxRequests: 10000, // per month
    features: [
      'Advanced Analytics',
      'Priority Support',
      'Advanced Security Features',
      'Custom Branding',
      'API Access'
    ]
  },
  ENTERPRISE: {
    name: 'Enterprise',
    maxUsers: -1, // Unlimited
    maxStorage: -1, // Unlimited
    maxRequests: -1, // Unlimited
    features: [
      'Custom Analytics',
      '24/7 Support',
      'Enterprise Security Features',
      'Custom Branding',
      'API Access',
      'Custom Integrations',
      'Dedicated Account Manager'
    ]
  }
} as const;

export type OrganizationTier = keyof typeof ORGANIZATION_TIERS; 