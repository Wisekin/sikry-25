export const EMAIL_PATTERNS = {
  basic: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  strict:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  domain: /@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
}

export const PHONE_PATTERNS = {
  us: /(\+?1[-.\s]?)?$$?([0-9]{3})$$?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
  international: /(\+[1-9]\d{1,14})/g,
  generic: /($$?\d{3}$$?[-.\s]?\d{3}[-.\s]?\d{4})/g,
}

export const SOCIAL_PATTERNS = {
  linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/([a-zA-Z0-9-]+)/g,
  twitter: /(?:https?:\/\/)?(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/g,
  facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9.]+)/g,
}

export const COMPANY_PATTERNS = {
  revenue: /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|billion|M|B|k)/gi,
  employees: /(\d{1,3}(?:,\d{3})*)\s*(?:employees?|staff|people)/gi,
  founded: /(?:founded|established|since)\s*(?:in\s*)?(\d{4})/gi,
  industry: /(?:industry|sector):\s*([a-zA-Z\s&,-]+)/gi,
}

export const ADDRESS_PATTERNS = {
  street: /\d+\s+[a-zA-Z\s,.-]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|place|pl)/gi,
  zipCode: /\b\d{5}(?:-\d{4})?\b/g,
  state: /\b[A-Z]{2}\b/g,
}

export function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_PATTERNS.basic) || []
  return [...new Set(matches)]
}

export function extractPhones(text: string): string[] {
  const matches = text.match(PHONE_PATTERNS.generic) || []
  return [...new Set(matches)]
}

export function extractSocialLinks(text: string) {
  return {
    linkedin: [...new Set(text.match(SOCIAL_PATTERNS.linkedin) || [])],
    twitter: [...new Set(text.match(SOCIAL_PATTERNS.twitter) || [])],
    facebook: [...new Set(text.match(SOCIAL_PATTERNS.facebook) || [])],
  }
}

export function extractCompanyMetrics(text: string) {
  const revenue = text.match(COMPANY_PATTERNS.revenue)
  const employees = text.match(COMPANY_PATTERNS.employees)
  const founded = text.match(COMPANY_PATTERNS.founded)
  const industry = text.match(COMPANY_PATTERNS.industry)

  return {
    revenue: revenue ? revenue[0] : null,
    employees: employees ? employees[0] : null,
    founded: founded ? founded[1] : null,
    industry: industry ? industry[1]?.trim() : null,
  }
}
