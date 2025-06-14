export enum CompanySize {
  STARTUP = "startup",
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  ENTERPRISE = "enterprise",
}

export enum CompanyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PROSPECT = "prospect",
  CUSTOMER = "customer",
}

export enum ContactRole {
  CEO = "CEO",
  CTO = "CTO",
  CFO = "CFO",
  VP_SALES = "VP Sales",
  VP_MARKETING = "VP Marketing",
  VP_ENGINEERING = "VP Engineering",
  DIRECTOR = "Director",
  MANAGER = "Manager",
  DEVELOPER = "Developer",
  ANALYST = "Analyst",
  OTHER = "Other",
}

export enum Industry {
  TECHNOLOGY = "Technology",
  HEALTHCARE = "Healthcare",
  FINANCE = "Finance",
  EDUCATION = "Education",
  RETAIL = "Retail",
  MANUFACTURING = "Manufacturing",
  CONSULTING = "Consulting",
  REAL_ESTATE = "Real Estate",
  MEDIA = "Media",
  TRANSPORTATION = "Transportation",
  ENERGY = "Energy",
  AGRICULTURE = "Agriculture",
  OTHER = "Other",
}

export enum ScraperType {
  V1 = "v1",
  V2 = "v2",
  AI = "ai",
}

export enum ScraperStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ERROR = "error",
  TESTING = "testing",
}

export enum FieldType {
  TEXT = "text",
  LINK = "link",
  IMAGE = "image",
  EMAIL = "email",
  PHONE = "phone",
  NUMBER = "number",
  DATE = "date",
}

export enum CampaignType {
  EMAIL = "email",
  LINKEDIN = "linkedin",
  PHONE = "phone",
  MULTI_CHANNEL = "multi-channel",
}

export enum CampaignStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  ARCHIVED = "archived",
}

export enum MessageStatus {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  REPLIED = "replied",
  BOUNCED = "bounced",
  FAILED = "failed",
}

export enum TemplateCategory {
  OUTREACH = "outreach",
  FOLLOW_UP = "follow-up",
  NURTURE = "nurture",
  ANNOUNCEMENT = "announcement",
}

export enum InsightType {
  NEWS = "news",
  FUNDING = "funding",
  HIRING = "hiring",
  TECHNOLOGY = "technology",
  PARTNERSHIP = "partnership",
}

export enum ThreatSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum OpportunityPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
  VIEWER = "viewer",
}

export enum Permission {
  READ_COMPANIES = "read:companies",
  WRITE_COMPANIES = "write:companies",
  DELETE_COMPANIES = "delete:companies",
  READ_CAMPAIGNS = "read:campaigns",
  WRITE_CAMPAIGNS = "write:campaigns",
  DELETE_CAMPAIGNS = "delete:campaigns",
  READ_SCRAPERS = "read:scrapers",
  WRITE_SCRAPERS = "write:scrapers",
  DELETE_SCRAPERS = "delete:scrapers",
  ADMIN_ACCESS = "admin:access",
}

export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

export enum DataSource {
  MANUAL = "manual",
  SCRAPER = "scraper",
  API = "api",
  IMPORT = "import",
  ENRICHMENT = "enrichment",
}

export enum ConfidenceLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERIFIED = "verified",
}

export const CONFIDENCE_SCORES = {
  [ConfidenceLevel.LOW]: 25,
  [ConfidenceLevel.MEDIUM]: 50,
  [ConfidenceLevel.HIGH]: 75,
  [ConfidenceLevel.VERIFIED]: 100,
} as const

export const COMPANY_SIZE_RANGES = {
  [CompanySize.STARTUP]: { min: 1, max: 10 },
  [CompanySize.SMALL]: { min: 11, max: 50 },
  [CompanySize.MEDIUM]: { min: 51, max: 200 },
  [CompanySize.LARGE]: { min: 201, max: 1000 },
  [CompanySize.ENTERPRISE]: { min: 1001, max: Number.POSITIVE_INFINITY },
} as const

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: [
    Permission.READ_COMPANIES,
    Permission.WRITE_COMPANIES,
    Permission.DELETE_COMPANIES,
    Permission.READ_CAMPAIGNS,
    Permission.WRITE_CAMPAIGNS,
    Permission.DELETE_CAMPAIGNS,
    Permission.READ_SCRAPERS,
    Permission.WRITE_SCRAPERS,
    Permission.DELETE_SCRAPERS,
    Permission.ADMIN_ACCESS,
  ],
  [UserRole.MANAGER]: [
    Permission.READ_COMPANIES,
    Permission.WRITE_COMPANIES,
    Permission.READ_CAMPAIGNS,
    Permission.WRITE_CAMPAIGNS,
    Permission.READ_SCRAPERS,
    Permission.WRITE_SCRAPERS,
  ],
  [UserRole.USER]: [
    Permission.READ_COMPANIES,
    Permission.WRITE_COMPANIES,
    Permission.READ_CAMPAIGNS,
    Permission.WRITE_CAMPAIGNS,
    Permission.READ_SCRAPERS,
  ],
  [UserRole.VIEWER]: [Permission.READ_COMPANIES, Permission.READ_CAMPAIGNS, Permission.READ_SCRAPERS],
} as const
