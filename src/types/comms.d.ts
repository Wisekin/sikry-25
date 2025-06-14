export interface Campaign {
  id: string
  name: string
  description: string
  type: "email" | "linkedin" | "phone" | "multi-channel"
  status: "draft" | "active" | "paused" | "completed" | "archived"
  templateId: string
  targetAudience: {
    companyFilters: any // Placeholder for CompanyFilter, which needs to be declared
    contactFilters: ContactFilter
    estimatedReach: number
  }
  schedule: {
    startDate: string
    endDate?: string
    frequency: "immediate" | "daily" | "weekly" | "monthly"
    time?: string
    timezone: string
  }
  settings: {
    sendLimit?: number
    throttle?: number
    personalizeSubject: boolean
    trackOpens: boolean
    trackClicks: boolean
    unsubscribeLink: boolean
  }
  stats: CampaignStats
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Template {
  id: string
  name: string
  description: string
  type: "email" | "linkedin" | "phone"
  category: "outreach" | "follow-up" | "nurture" | "announcement"
  subject?: string
  content: string
  variables: TemplateVariable[]
  settings: {
    spamScore?: number
    readabilityScore?: number
    personalizeContent: boolean
    includeSignature: boolean
  }
  tags: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface TemplateVariable {
  name: string
  type: "text" | "number" | "date" | "boolean" | "company" | "contact"
  required: boolean
  defaultValue?: string
  description?: string
}

export interface Message {
  id: string
  campaignId: string
  templateId: string
  contactId: string
  companyId: string
  channel: "email" | "linkedin" | "phone"
  status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "replied" | "bounced" | "failed"
  subject?: string
  content: string
  sentAt?: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  repliedAt?: string
  metadata: {
    messageId?: string
    threadId?: string
    provider?: string
    ipAddress?: string
    userAgent?: string
  }
  tracking: {
    opens: number
    clicks: number
    replies: number
    forwards: number
  }
  errors: MessageError[]
}

export interface MessageError {
  type: "delivery" | "spam" | "bounce" | "rate-limit" | "authentication"
  message: string
  code?: string
  timestamp: string
}

export interface CampaignStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  replied: number
  bounced: number
  failed: number
  unsubscribed: number
  openRate: number
  clickRate: number
  replyRate: number
  bounceRate: number
}

export interface ContactFilter {
  role?: string[]
  department?: string[]
  seniority?: string[]
  verified?: boolean
  hasEmail?: boolean
  hasPhone?: boolean
  hasLinkedIn?: boolean
  engagementScore?: { min?: number; max?: number }
  lastContacted?: { before?: string; after?: string }
}

// Declare CompanyFilter interface
export type CompanyFilter = {}
