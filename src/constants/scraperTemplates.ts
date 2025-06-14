import type { ScraperConfig, FieldSelector } from "@/src/types/scraping"

export const SCRAPER_TEMPLATES: Record<string, ScraperConfig> = {
  "company-directory": {
    selectors: [
      {
        id: "company-name",
        name: "Company Name",
        selector: "h1, .company-name, [data-company-name]",
        type: "text",
        required: true,
        multiple: false,
      },
      {
        id: "company-description",
        name: "Description",
        selector: ".description, .about, .summary",
        type: "text",
        required: false,
        multiple: false,
      },
      {
        id: "website",
        name: "Website",
        selector: 'a[href*="http"], .website a',
        type: "link",
        required: false,
        multiple: false,
      },
      {
        id: "industry",
        name: "Industry",
        selector: ".industry, [data-industry]",
        type: "text",
        required: false,
        multiple: false,
      },
      {
        id: "location",
        name: "Location",
        selector: ".location, .address, [data-location]",
        type: "text",
        required: false,
        multiple: false,
      },
    ],
    pagination: {
      type: "button",
      selector: ".next, .pagination-next, [data-next]",
      maxPages: 10,
      delay: 2000,
    },
    rateLimit: {
      requests: 10,
      period: 60000,
    },
    timeout: 30000,
    retries: 3,
  },

  "contact-list": {
    selectors: [
      {
        id: "contact-name",
        name: "Contact Name",
        selector: ".name, .contact-name, h3, h4",
        type: "text",
        required: true,
        multiple: false,
      },
      {
        id: "email",
        name: "Email",
        selector: 'a[href^="mailto:"], .email, [data-email]',
        type: "email",
        required: false,
        multiple: false,
      },
      {
        id: "phone",
        name: "Phone",
        selector: 'a[href^="tel:"], .phone, [data-phone]',
        type: "phone",
        required: false,
        multiple: false,
      },
      {
        id: "role",
        name: "Role/Title",
        selector: ".title, .role, .position, .job-title",
        type: "text",
        required: false,
        multiple: false,
      },
      {
        id: "linkedin",
        name: "LinkedIn Profile",
        selector: 'a[href*="linkedin.com"]',
        type: "link",
        required: false,
        multiple: false,
      },
    ],
    rateLimit: {
      requests: 20,
      period: 60000,
    },
    timeout: 20000,
    retries: 2,
  },

  "news-articles": {
    selectors: [
      {
        id: "headline",
        name: "Headline",
        selector: "h1, .headline, .title, [data-headline]",
        type: "text",
        required: true,
        multiple: false,
      },
      {
        id: "content",
        name: "Article Content",
        selector: ".content, .article-body, .post-content",
        type: "text",
        required: true,
        multiple: false,
      },
      {
        id: "author",
        name: "Author",
        selector: ".author, .byline, [data-author]",
        type: "text",
        required: false,
        multiple: false,
      },
      {
        id: "publish-date",
        name: "Publish Date",
        selector: ".date, .publish-date, time, [datetime]",
        type: "date",
        required: false,
        multiple: false,
      },
      {
        id: "tags",
        name: "Tags",
        selector: ".tags a, .categories a, .tag",
        type: "text",
        required: false,
        multiple: true,
      },
    ],
    pagination: {
      type: "url",
      maxPages: 5,
      delay: 3000,
    },
    rateLimit: {
      requests: 15,
      period: 60000,
    },
    timeout: 25000,
  },

  "job-listings": {
    selectors: [
      {
        id: "job-title",
        name: "Job Title",
        selector: ".job-title, h1, h2, [data-job-title]",
        type: "text",
        required: true,
        multiple: false,
      },
      {
        id: "company",
        name: "Company",
        selector: ".company, .employer, [data-company]",
        type: "text",
        required: true,
        multiple: false,
      },
      {
        id: "location",
        name: "Location",
        selector: ".location, .job-location, [data-location]",
        type: "text",
        required: false,
        multiple: false,
      },
      {
        id: "salary",
        name: "Salary",
        selector: ".salary, .compensation, [data-salary]",
        type: "text",
        required: false,
        multiple: false,
      },
      {
        id: "description",
        name: "Job Description",
        selector: ".description, .job-description, .content",
        type: "text",
        required: false,
        multiple: false,
      },
      {
        id: "requirements",
        name: "Requirements",
        selector: ".requirements, .qualifications",
        type: "text",
        required: false,
        multiple: false,
      },
    ],
    pagination: {
      type: "button",
      selector: ".next-page, .pagination-next",
      maxPages: 20,
      delay: 2000,
    },
    rateLimit: {
      requests: 12,
      period: 60000,
    },
    timeout: 30000,
  },

  "social-media-profiles": {
    selectors: [
      {
        id: "profile-name",
        name: "Profile Name",
        selector: "h1, .profile-name, .name, [data-name]",
        type: "text",
        required: true,
        multiple: false,
      },
      {
        id: "bio",
        name: "Bio/Description",
        selector: ".bio, .description, .about",
        type: "text",
        required: false,
        multiple: false,
      },
      {
        id: "followers",
        name: "Followers Count",
        selector: ".followers, [data-followers]",
        type: "number",
        required: false,
        multiple: false,
      },
      {
        id: "following",
        name: "Following Count",
        selector: ".following, [data-following]",
        type: "number",
        required: false,
        multiple: false,
      },
      {
        id: "posts",
        name: "Posts Count",
        selector: ".posts, .tweets, [data-posts]",
        type: "number",
        required: false,
        multiple: false,
      },
      {
        id: "website",
        name: "Website",
        selector: ".website a, .link a, [data-website]",
        type: "link",
        required: false,
        multiple: false,
      },
    ],
    rateLimit: {
      requests: 8,
      period: 60000,
    },
    timeout: 15000,
    retries: 1,
  },

  "product-catalog": {
    selectors: [
      {
        id: "product-name",
        name: "Product Name",
        selector: ".product-name, h1, h2, [data-product-name]",
        type: "text",
        required: true,
        multiple: false,
      },
      {
        id: "price",
        name: "Price",
        selector: ".price, .cost, [data-price]",
        type: "text",
        required: false,
        multiple: false,
      },
      {
        id: "description",
        name: "Description",
        selector: ".description, .product-description",
        type: "text",
        required: false,
        multiple: false,
      },
      {
        id: "image",
        name: "Product Image",
        selector: ".product-image img, .main-image img",
        type: "image",
        required: false,
        multiple: false,
      },
      {
        id: "category",
        name: "Category",
        selector: ".category, .product-category, [data-category]",
        type: "text",
        required: false,
        multiple: false,
      },
      {
        id: "rating",
        name: "Rating",
        selector: ".rating, .stars, [data-rating]",
        type: "text",
        required: false,
        multiple: false,
      },
    ],
    pagination: {
      type: "button",
      selector: ".load-more, .next-page",
      maxPages: 15,
      delay: 1500,
    },
    rateLimit: {
      requests: 25,
      period: 60000,
    },
    timeout: 20000,
  },
}

export const TEMPLATE_CATEGORIES = {
  "Business Intelligence": ["company-directory", "contact-list", "job-listings"],
  "Content & Media": ["news-articles", "social-media-profiles"],
  "E-commerce": ["product-catalog"],
} as const

export function getTemplateByName(name: string): ScraperConfig | null {
  return SCRAPER_TEMPLATES[name] || null
}

export function getTemplateNames(): string[] {
  return Object.keys(SCRAPER_TEMPLATES)
}

export function getTemplatesByCategory(category: string): string[] {
  return TEMPLATE_CATEGORIES[category as keyof typeof TEMPLATE_CATEGORIES] || []
}

export function createCustomTemplate(
  name: string,
  selectors: FieldSelector[],
  options?: Partial<ScraperConfig>,
): ScraperConfig {
  return {
    selectors,
    rateLimit: {
      requests: 10,
      period: 60000,
    },
    timeout: 30000,
    retries: 3,
    ...options,
  }
}
