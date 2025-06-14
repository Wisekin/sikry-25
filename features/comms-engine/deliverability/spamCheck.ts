export interface SpamCheckResult {
  score: number // 0-100, higher is more likely spam
  issues: SpamIssue[]
  recommendations: string[]
  deliverabilityScore: number
}

export interface SpamIssue {
  type: "content" | "formatting" | "links" | "sender" | "technical"
  severity: "low" | "medium" | "high"
  description: string
  impact: number
}

export class SpamChecker {
  private static SPAM_KEYWORDS = [
    "free",
    "urgent",
    "limited time",
    "act now",
    "click here",
    "guaranteed",
    "no obligation",
    "risk free",
    "cash",
    "money back",
  ]

  private static SUSPICIOUS_PATTERNS = [
    /\$\d+/g, // Money amounts
    /!!+/g, // Multiple exclamation marks
    /CAPS{3,}/g, // Excessive caps
    /\b(buy|call|click)\s+now\b/gi,
    /\b(free|urgent|limited)\b/gi,
  ]

  static async checkSpam(content: string, subject: string, senderDomain: string): Promise<SpamCheckResult> {
    const issues: SpamIssue[] = []
    let totalScore = 0

    // Content analysis
    const contentIssues = this.analyzeContent(content, subject)
    issues.push(...contentIssues)
    totalScore += contentIssues.reduce((sum, issue) => sum + issue.impact, 0)

    // Formatting analysis
    const formatIssues = this.analyzeFormatting(content)
    issues.push(...formatIssues)
    totalScore += formatIssues.reduce((sum, issue) => sum + issue.impact, 0)

    // Link analysis
    const linkIssues = this.analyzeLinks(content)
    issues.push(...linkIssues)
    totalScore += linkIssues.reduce((sum, issue) => sum + issue.impact, 0)

    // Sender reputation (simplified)
    const senderIssues = this.analyzeSender(senderDomain)
    issues.push(...senderIssues)
    totalScore += senderIssues.reduce((sum, issue) => sum + issue.impact, 0)

    const spamScore = Math.min(totalScore, 100)
    const deliverabilityScore = Math.max(0, 100 - spamScore)

    return {
      score: spamScore,
      issues,
      recommendations: this.generateRecommendations(issues),
      deliverabilityScore,
    }
  }

  private static analyzeContent(content: string, subject: string): SpamIssue[] {
    const issues: SpamIssue[] = []
    const fullText = `${subject} ${content}`.toLowerCase()

    // Check for spam keywords
    const spamKeywordCount = this.SPAM_KEYWORDS.filter((keyword) => fullText.includes(keyword.toLowerCase())).length

    if (spamKeywordCount > 2) {
      issues.push({
        type: "content",
        severity: "high",
        description: `Contains ${spamKeywordCount} spam keywords`,
        impact: spamKeywordCount * 5,
      })
    }

    // Check for suspicious patterns
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      const matches = fullText.match(pattern)
      if (matches && matches.length > 2) {
        issues.push({
          type: "content",
          severity: "medium",
          description: `Suspicious pattern detected: ${pattern.source}`,
          impact: matches.length * 3,
        })
      }
    }

    // Subject line analysis
    if (subject.length > 50) {
      issues.push({
        type: "content",
        severity: "low",
        description: "Subject line is too long",
        impact: 2,
      })
    }

    if (subject.includes("!") && subject.split("!").length > 2) {
      issues.push({
        type: "content",
        severity: "medium",
        description: "Too many exclamation marks in subject",
        impact: 5,
      })
    }

    return issues
  }

  private static analyzeFormatting(content: string): SpamIssue[] {
    const issues: SpamIssue[] = []

    // Check for excessive formatting
    const htmlTagCount = (content.match(/<[^>]+>/g) || []).length
    const textLength = content.replace(/<[^>]+>/g, "").length

    if (htmlTagCount > 0 && textLength > 0) {
      const formatRatio = htmlTagCount / textLength
      if (formatRatio > 0.1) {
        issues.push({
          type: "formatting",
          severity: "medium",
          description: "Excessive HTML formatting detected",
          impact: 8,
        })
      }
    }

    // Check for color abuse
    const colorMatches = content.match(/color\s*[:=]\s*["']?[^"';]+/gi) || []
    if (colorMatches.length > 3) {
      issues.push({
        type: "formatting",
        severity: "low",
        description: "Too many different colors used",
        impact: 3,
      })
    }

    return issues
  }

  private static analyzeLinks(content: string): SpamIssue[] {
    const issues: SpamIssue[] = []

    // Extract links
    const linkMatches = content.match(/https?:\/\/[^\s<>"]+/gi) || []
    const uniqueDomains = new Set(
      linkMatches
        .map((link) => {
          try {
            return new URL(link).hostname
          } catch {
            return null
          }
        })
        .filter(Boolean),
    )

    // Too many different domains
    if (uniqueDomains.size > 3) {
      issues.push({
        type: "links",
        severity: "high",
        description: `Links to ${uniqueDomains.size} different domains`,
        impact: uniqueDomains.size * 2,
      })
    }

    // Suspicious link patterns
    const suspiciousLinks = linkMatches.filter(
      (link) => /bit\.ly|tinyurl|t\.co|short/.test(link) || /\d+\.\d+\.\d+\.\d+/.test(link), // IP addresses
    )

    if (suspiciousLinks.length > 0) {
      issues.push({
        type: "links",
        severity: "high",
        description: "Contains suspicious or shortened links",
        impact: suspiciousLinks.length * 10,
      })
    }

    return issues
  }

  private static analyzeSender(domain: string): SpamIssue[] {
    const issues: SpamIssue[] = []

    // Basic domain validation
    if (!domain || !domain.includes(".")) {
      issues.push({
        type: "sender",
        severity: "high",
        description: "Invalid sender domain",
        impact: 20,
      })
    }

    // Check for suspicious TLDs
    const suspiciousTlds = [".tk", ".ml", ".ga", ".cf"]
    if (suspiciousTlds.some((tld) => domain.endsWith(tld))) {
      issues.push({
        type: "sender",
        severity: "medium",
        description: "Sender uses suspicious top-level domain",
        impact: 10,
      })
    }

    return issues
  }

  private static generateRecommendations(issues: SpamIssue[]): string[] {
    const recommendations: string[] = []

    if (issues.some((i) => i.type === "content")) {
      recommendations.push("Reduce use of promotional language and spam keywords")
      recommendations.push("Use more natural, conversational tone")
    }

    if (issues.some((i) => i.type === "formatting")) {
      recommendations.push("Simplify HTML formatting and reduce excessive styling")
      recommendations.push("Use plain text or minimal HTML formatting")
    }

    if (issues.some((i) => i.type === "links")) {
      recommendations.push("Limit number of external links")
      recommendations.push("Use full URLs instead of shortened links")
    }

    if (issues.some((i) => i.type === "sender")) {
      recommendations.push("Verify sender domain and improve domain reputation")
      recommendations.push("Set up proper SPF, DKIM, and DMARC records")
    }

    return recommendations
  }
}
