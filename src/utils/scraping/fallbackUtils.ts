export function createFallbackSelectors(primarySelector: string): string[] {
  const fallbacks: string[] = []

  // If it's an ID selector, try class alternatives
  if (primarySelector.startsWith("#")) {
    const id = primarySelector.substring(1)
    fallbacks.push(`[id="${id}"]`, `[data-id="${id}"]`, `.${id}`, `[class*="${id}"]`)
  }

  // If it's a class selector, try alternatives
  if (primarySelector.startsWith(".")) {
    const className = primarySelector.substring(1)
    fallbacks.push(`[class="${className}"]`, `[class*="${className}"]`, `[data-class="${className}"]`, `#${className}`)
  }

  // Add generic fallbacks based on common patterns
  if (primarySelector.includes("email")) {
    fallbacks.push('[type="email"]', '[name*="email"]', '[placeholder*="email"]', 'input[type="email"]')
  }

  if (primarySelector.includes("phone")) {
    fallbacks.push('[type="tel"]', '[name*="phone"]', '[placeholder*="phone"]', 'input[type="tel"]')
  }

  if (primarySelector.includes("name")) {
    fallbacks.push('[name*="name"]', '[placeholder*="name"]', 'input[name*="name"]')
  }

  return fallbacks
}

export function generateSmartSelector(element: any): string {
  if (!element) return ""

  // Try ID first
  if (element.id) {
    return `#${element.id}`
  }

  // Try unique class
  if (element.className) {
    const classes = element.className.split(" ").filter(Boolean)
    for (const cls of classes) {
      if (cls.length > 2 && !cls.includes("btn") && !cls.includes("form")) {
        return `.${cls}`
      }
    }
  }

  // Try data attributes
  const dataAttrs = Object.keys(element.dataset || {})
  if (dataAttrs.length > 0) {
    return `[data-${dataAttrs[0]}="${element.dataset[dataAttrs[0]]}"]`
  }

  // Try name attribute
  if (element.name) {
    return `[name="${element.name}"]`
  }

  // Try type for inputs
  if (element.type && element.tagName === "INPUT") {
    return `input[type="${element.type}"]`
  }

  // Fallback to tag with position
  const siblings = Array.from(element.parentNode?.children || [])
  const index = siblings.indexOf(element)
  return `${element.tagName.toLowerCase()}:nth-child(${index + 1})`
}

export function validateSelector(selector: string): { valid: boolean; error?: string } {
  try {
    document.querySelector(selector)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid selector",
    }
  }
}

export function optimizeSelector(selector: string): string {
  return selector
    .replace(/\s+/g, " ")
    .replace(/>\s+/g, ">")
    .replace(/\s+>/g, ">")
    .replace(/\s*,\s*/g, ",")
    .trim()
}

export function getSelectorSpecificity(selector: string): number {
  let specificity = 0

  // Count IDs
  specificity += (selector.match(/#/g) || []).length * 100

  // Count classes and attributes
  specificity += (selector.match(/\.|:\w+|\[/g) || []).length * 10

  // Count elements
  specificity += (selector.match(/\b[a-z]+/g) || []).length

  return specificity
}

export function simplifySelector(selector: string): string {
  // Remove unnecessary parent selectors
  const parts = selector.split(" ")
  if (parts.length > 3) {
    return parts.slice(-2).join(" ")
  }
  return selector
}
