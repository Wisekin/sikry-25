import type { VSLPage } from "@/types/vsl"

export const VSL_TEMPLATES: Record<string, Partial<VSLPage>> = {
  "saas-demo": {
    name: "SaaS Demo Template",
    title: "Transform Your Business with Our Revolutionary SaaS Platform",
    headline: "Discover How 10,000+ Companies Are Scaling 10x Faster",
    template_type: "premium",
    primary_color: "#3B82F6",
    secondary_color: "#1E40AF",
    background_type: "gradient",
    background_gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    cta_text: "Start Your Free Trial",
    cta_button_color: "#10B981",
    bullet_points: [
      "✅ Automate 90% of your manual processes",
      "✅ Reduce operational costs by 60%",
      "✅ Scale without hiring additional staff",
      "✅ Get real-time insights and analytics",
      "✅ 24/7 customer support included",
    ],
    testimonials: [
      {
        name: "Sarah Johnson",
        content: "This platform transformed our business operations. We've seen 300% growth in just 6 months!",
        company: "TechStart Inc.",
        rating: 5,
      },
      {
        name: "Michael Chen",
        content: "The automation features saved us 40 hours per week. ROI was immediate.",
        company: "Growth Dynamics",
        rating: 5,
      },
    ],
    video_url: "https://player.vimeo.com/video/example",
    requires_opt_in: true,
    collect_phone: true,
    collect_company: true,
  },

  "consulting-services": {
    name: "Consulting Services Template",
    title: "Unlock Your Business Potential with Expert Consulting",
    headline: "How We've Helped 500+ Companies Achieve 10x Growth",
    template_type: "standard",
    primary_color: "#059669",
    secondary_color: "#047857",
    background_type: "solid",
    background_color: "#F9FAFB",
    cta_text: "Book Your Strategy Call",
    cta_button_color: "#DC2626",
    bullet_points: [
      "🎯 Custom growth strategies for your industry",
      "📈 Proven frameworks that deliver results",
      "🤝 1-on-1 expert guidance and support",
      "⚡ Fast implementation and quick wins",
      "💰 Guaranteed ROI or money back",
    ],
    testimonials: [
      {
        name: "David Rodriguez",
        content: "Their strategic guidance helped us increase revenue by 250% in 12 months.",
        company: "Rodriguez Enterprises",
        rating: 5,
      },
      {
        name: "Lisa Thompson",
        content: "The best investment we've made. Clear roadmap, excellent execution.",
        company: "Thompson & Associates",
        rating: 5,
      },
    ],
    requires_opt_in: false,
    collect_phone: true,
    collect_company: true,
  },

  "ecommerce-product": {
    name: "E-commerce Product Template",
    title: "The Revolutionary Product That's Changing Everything",
    headline: "Join 50,000+ Happy Customers Who've Transformed Their Lives",
    template_type: "premium",
    primary_color: "#7C3AED",
    secondary_color: "#5B21B6",
    background_type: "image",
    background_image: "/images/ecommerce-bg.jpg",
    cta_text: "Order Now - Limited Time",
    cta_button_color: "#F59E0B",
    bullet_points: [
      "🌟 Premium quality materials and craftsmanship",
      "🚚 Free shipping worldwide",
      "💯 30-day money-back guarantee",
      "⭐ 4.9/5 star rating from 10,000+ reviews",
      "🎁 Exclusive bonuses worth $200",
    ],
    testimonials: [
      {
        name: "Jennifer Adams",
        content: "This product exceeded all my expectations. Quality is outstanding!",
        company: "Verified Buyer",
        rating: 5,
      },
      {
        name: "Robert Kim",
        content: "Best purchase I've made this year. Highly recommend to everyone!",
        company: "Verified Buyer",
        rating: 5,
      },
    ],
    requires_opt_in: false,
    collect_phone: false,
    collect_company: false,
  },

  "webinar-registration": {
    name: "Webinar Registration Template",
    title: "Free Masterclass: The Secrets to 10x Growth",
    headline: "Learn the Exact Strategies Used by Industry Leaders",
    template_type: "standard",
    primary_color: "#EF4444",
    secondary_color: "#DC2626",
    background_type: "gradient",
    background_gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
    cta_text: "Reserve My Seat (Free)",
    cta_button_color: "#FBBF24",
    bullet_points: [
      "📚 3 proven strategies for rapid growth",
      "💡 Case studies from successful companies",
      "🔧 Actionable tools and templates",
      "❓ Live Q&A with industry experts",
      "🎁 Exclusive bonus materials",
    ],
    testimonials: [
      {
        name: "Amanda Foster",
        content: "This webinar completely changed my approach to business. Incredible value!",
        company: "Foster Marketing",
        rating: 5,
      },
      {
        name: "James Wilson",
        content: "Practical strategies I could implement immediately. Highly recommended!",
        company: "Wilson Consulting",
        rating: 5,
      },
    ],
    requires_opt_in: true,
    collect_phone: true,
    collect_company: true,
  },

  "lead-magnet": {
    name: "Lead Magnet Template",
    title: "Free Guide: The Ultimate Business Growth Blueprint",
    headline: "Download the Same Guide That Helped 1,000+ Entrepreneurs Scale",
    template_type: "standard",
    primary_color: "#8B5CF6",
    secondary_color: "#7C3AED",
    background_type: "solid",
    background_color: "#FFFFFF",
    cta_text: "Download Free Guide",
    cta_button_color: "#10B981",
    bullet_points: [
      "📖 50-page comprehensive guide",
      "📊 Templates and worksheets included",
      "🎯 Step-by-step implementation plan",
      "💼 Real-world case studies",
      "🔄 Lifetime updates included",
    ],
    testimonials: [
      {
        name: "Maria Gonzalez",
        content: "This guide is pure gold! Implemented the strategies and saw immediate results.",
        company: "Gonzalez Ventures",
        rating: 5,
      },
      {
        name: "Thomas Brown",
        content: "Best free resource I've ever downloaded. Worth way more than free!",
        company: "Brown Industries",
        rating: 5,
      },
    ],
    requires_opt_in: true,
    collect_phone: false,
    collect_company: true,
  },
}

export const TEMPLATE_CATEGORIES = {
  Business: ["saas-demo", "consulting-services", "webinar-registration"],
  "E-commerce": ["ecommerce-product"],
  "Lead Generation": ["lead-magnet", "webinar-registration"],
  Services: ["consulting-services"],
} as const

export function getTemplateByKey(key: string): Partial<VSLPage> | null {
  return VSL_TEMPLATES[key] || null
}

export function getTemplateNames(): string[] {
  return Object.keys(VSL_TEMPLATES)
}

export function getTemplatesByCategory(category: string): string[] {
  return TEMPLATE_CATEGORIES[category as keyof typeof TEMPLATE_CATEGORIES] || []
}
