export const ROUTES = {
  // Public routes
  HOME: "/",
  FEATURES: "/features",
  PRICING: "/pricing",

  // Auth routes
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  RESET_PASSWORD: "/auth/reset-password",

  // Dashboard routes
  DASHBOARD: "/dashboard",
  SEARCH: "/search",
  COMPANIES: "/companies",
  COMPANY_DETAIL: (id: string) => `/companies/${id}`,

  // Communication routes
  COMMS: "/comms",
  CAMPAIGNS: "/comms/campaigns",
  CAMPAIGN_DETAIL: (id: string) => `/comms/campaigns/${id}`,
  TEMPLATES: "/comms/templates",
  BULK_SENDER: "/comms/bulk-sender",

  // Market Intelligence
  MARKET_INTEL: "/market-intel",

  // Scrapers
  SCRAPERS: "/scrapers",
  SCRAPER_NEW: "/scrapers/new",
  SCRAPER_DETAIL: (id: string) => `/scrapers/${id}`,
  SCRAPER_CONFIG: (id: string) => `/scrapers/${id}/config`,
  SCRAPER_TEST: (id: string) => `/scrapers/${id}/test`,

  // Admin routes
  ADMIN: "/admin",
  ADMIN_TEAM: "/admin/team",
  ADMIN_BILLING: "/admin/billing",
  ADMIN_ANTI_SPAM: "/admin/anti-spam",
  ADMIN_COMPLIANCE: "/admin/compliance",

  // API routes
  API: {
    SEARCH: "/api/search",
    COMPANIES: "/api/companies",
    COMMS: "/api/comms",
    SCRAPERS: "/api/scrapers",
    SELECTOR_DISCOVERY: "/api/selector-discovery",
  },
} as const

export const NAVIGATION_ITEMS = [
  {
    title: "Search",
    href: ROUTES.SEARCH,
    icon: "Search",
    description: "Natural language company search",
  },
  {
    title: "Companies",
    href: ROUTES.COMPANIES,
    icon: "Building2",
    description: "Manage company database",
  },
  {
    title: "Communications",
    href: ROUTES.COMMS,
    icon: "MessageSquare",
    description: "Unified messaging platform",
  },
  {
    title: "Market Intel",
    href: ROUTES.MARKET_INTEL,
    icon: "TrendingUp",
    description: "Market analysis and insights",
  },
  {
    title: "Scrapers",
    href: ROUTES.SCRAPERS,
    icon: "Bot",
    description: "Data collection tools",
  },
  {
    title: "Admin",
    href: ROUTES.ADMIN,
    icon: "Settings",
    description: "System administration",
  },
] as const

export const BREADCRUMB_LABELS = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.SEARCH]: "Search",
  [ROUTES.COMPANIES]: "Companies",
  [ROUTES.COMMS]: "Communications",
  [ROUTES.CAMPAIGNS]: "Campaigns",
  [ROUTES.TEMPLATES]: "Templates",
  [ROUTES.BULK_SENDER]: "Bulk Sender",
  [ROUTES.MARKET_INTEL]: "Market Intelligence",
  [ROUTES.SCRAPERS]: "Scrapers",
  [ROUTES.SCRAPER_NEW]: "New Scraper",
  [ROUTES.ADMIN]: "Admin",
  [ROUTES.ADMIN_TEAM]: "Team",
  [ROUTES.ADMIN_BILLING]: "Billing",
  [ROUTES.ADMIN_ANTI_SPAM]: "Anti-Spam",
  [ROUTES.ADMIN_COMPLIANCE]: "Compliance",
} as const
