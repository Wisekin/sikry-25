import DOMPurify from "isomorphic-dompurify"

export class InputSanitizer {
  static sanitizeString(input: string): string {
    if (typeof input !== "string") return ""

    return input
      .trim()
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .substring(0, 1000) // Limit length
  }

  static sanitizeEmail(email: string): string {
    if (typeof email !== "string") return ""

    return email
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, "")
      .substring(0, 254)
  }

  static sanitizeUrl(url: string): string {
    if (typeof url !== "string") return ""

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

  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ol", "ul", "li", "a", "h1", "h2", "h3", "h4", "h5", "h6"],
      ALLOWED_ATTR: ["href", "target", "rel"],
      ALLOW_DATA_ATTR: false,
    })
  }

  static sanitizeObject(
    obj: Record<string, any>,
    rules: Record<string, "string" | "email" | "url" | "html">,
  ): Record<string, any> {
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(obj)) {
      const rule = rules[key]

      if (!rule) {
        sanitized[key] = value
        continue
      }

      switch (rule) {
        case "string":
          sanitized[key] = this.sanitizeString(value)
          break
        case "email":
          sanitized[key] = this.sanitizeEmail(value)
          break
        case "url":
          sanitized[key] = this.sanitizeUrl(value)
          break
        case "html":
          sanitized[key] = this.sanitizeHtml(value)
          break
        default:
          sanitized[key] = value
      }
    }

    return sanitized
  }

  static validateInput(input: string, type: "email" | "url" | "phone" | "text"): boolean {
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
        return /^\+?[\d\s\-()]{10,}$/.test(input)
      case "text":
        return input.length > 0 && input.length <= 1000
      default:
        return false
    }
  }
}
