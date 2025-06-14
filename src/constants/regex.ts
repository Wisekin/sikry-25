export const REGEX_PATTERNS = {
  // Email validation
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  EMAIL_LOOSE: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

  // Phone validation
  PHONE: /^\+?[\d\s\-$$$$]{10,}$/,
  PHONE_EXTRACT: /(\+?[\d\s\-$$$$]{10,})/g,

  // URL validation
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  URL_EXTRACT: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,

  // Domain validation
  DOMAIN: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,

  // Social media patterns
  LINKEDIN_PROFILE: /linkedin\.com\/in\/[a-zA-Z0-9-]+/,
  TWITTER_HANDLE: /@[a-zA-Z0-9_]+/,

  // Company data patterns
  COMPANY_SIZE: /(\d+[-+]?\s*(employees?|people|staff|team members?))/i,
  REVENUE: /(\$?\d+[.,]?\d*\s*(million|billion|M|B|k)?\s*(revenue|sales|turnover))/i,
  FUNDING: /(\$?\d+[.,]?\d*\s*(million|billion|M|B|k)?\s*(funding|investment|raised))/i,

  // Address patterns
  ADDRESS: /\d+\s+[a-zA-Z0-9\s,.-]+,\s*[a-zA-Z\s]+,?\s*[a-zA-Z]{2,}\s*\d{5}/,
  POSTAL_CODE: /\b\d{5}(-\d{4})?\b/,

  // Technology patterns
  TECH_STACK: /(React|Vue|Angular|Node\.js|Python|Java|PHP|Ruby|Go|Rust|TypeScript|JavaScript)/gi,

  // Industry patterns
  INDUSTRY_KEYWORDS: /(software|technology|healthcare|finance|education|retail|manufacturing|consulting)/gi,

  // Data extraction patterns
  NUMBERS: /\d+/g,
  CURRENCY: /\$[\d,]+(\.\d{2})?/g,
  PERCENTAGE: /\d+(\.\d+)?%/g,

  // Validation patterns
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,

  // Security patterns
  SQL_INJECTION: /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
  XSS: /<script|javascript:|on\w+=/i,

  // File patterns
  IMAGE_FILE: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
  DOCUMENT_FILE: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i,

  // API patterns
  API_KEY: /^[a-zA-Z0-9]{32,}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const

export const CSS_SELECTORS = {
  // Common form selectors
  EMAIL_INPUTS: 'input[type="email"], input[name*="email"], input[placeholder*="email"]',
  PHONE_INPUTS: 'input[type="tel"], input[name*="phone"], input[placeholder*="phone"]',
  NAME_INPUTS: 'input[name*="name"], input[placeholder*="name"]',

  // Company information selectors
  COMPANY_NAME: "h1, .company-name, [data-company-name], .org-name",
  COMPANY_DESCRIPTION: ".description, .about, .summary, [data-description]",
  COMPANY_LOGO: 'img[alt*="logo"], .logo img, [data-logo]',

  // Contact information selectors
  CONTACT_INFO: ".contact, .contact-info, [data-contact]",
  ADDRESS: ".address, [data-address], .location",

  // Social media selectors
  SOCIAL_LINKS: 'a[href*="linkedin"], a[href*="twitter"], a[href*="facebook"]',
  LINKEDIN: 'a[href*="linkedin.com"]',
  TWITTER: 'a[href*="twitter.com"], a[href*="x.com"]',

  // Navigation selectors
  NAVIGATION: 'nav, .nav, .navigation, [role="navigation"]',
  MENU: ".menu, .main-menu, [data-menu]",

  // Content selectors
  MAIN_CONTENT: 'main, .main, .content, [role="main"]',
  ARTICLE: 'article, .article, .post, [role="article"]',

  // Table selectors
  DATA_TABLE: 'table, .table, [role="table"]',
  TABLE_HEADER: 'th, .table-header, [role="columnheader"]',
  TABLE_CELL: 'td, .table-cell, [role="cell"]',
} as const

export function validatePattern(pattern: string, value: string): boolean {
  try {
    const regex = new RegExp(pattern)
    return regex.test(value)
  } catch {
    return false
  }
}

export function extractMatches(pattern: RegExp, text: string): string[] {
  const matches = text.match(pattern)
  return matches || []
}

export function sanitizeRegexInput(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
