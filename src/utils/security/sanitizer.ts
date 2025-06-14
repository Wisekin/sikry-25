import DOMPurify from "isomorphic-dompurify"

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ol", "ul", "li", "a", "h1", "h2", "h3", "h4", "h5", "h6"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  })
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
}

export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .replace(/[^\w@.-]/g, "")
    .trim()
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return ""
    }
    return parsed.toString()
  } catch {
    return ""
  }
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 255)
}

export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[<>]/g, "").replace(/['"]/g, "").replace(/\s+/g, " ").trim().substring(0, 500)
}

export function validateInput(input: string, type: "email" | "url" | "phone" | "text"): boolean {
  switch (type) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
    case "url":
      try {
        new URL(input)
        return true
      } catch {
        return false
      }
    case "phone":
      return /^\+?[\d\s\-$$$$]{10,}$/.test(input)
    case "text":
      return input.length > 0 && input.length <= 1000
    default:
      return false
  }
}

export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}
