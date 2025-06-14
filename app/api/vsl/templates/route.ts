import { NextResponse } from 'next/server';
import { createMockApiResponse } from '@/utils/mockApiUtils';

export interface VSLTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailUrl?: string; // Using a generic placeholder for now
  createdAt: string;
  tags?: string[];
  category?: string; // Added for more detail
  contentPreview?: string; // A snippet or structural representation
}

const mockVSLTemplates: VSLTemplate[] = [
  {
    id: 'vsl-template-001',
    name: 'Classic Direct Response VSL',
    description: 'A high-converting VSL template focused on direct sales, problem/solution, and a strong call to action. Ideal for product launches.',
    thumbnailUrl: '/placeholder.svg', // General placeholder
    createdAt: '2024-05-15T09:00:00Z',
    tags: ['Direct Response', 'Product Launch', 'Sales'],
    category: 'Sales & Marketing',
    contentPreview: 'Hook -> Problem Agitation -> Solution Intro -> Product Demo -> Offer Stack -> Testimonials -> CTA -> Scarcity/Urgency -> Guarantee -> Final CTA',
  },
  {
    id: 'vsl-template-002',
    name: 'Webinar Registration VSL',
    description: 'Engage potential attendees and drive sign-ups for your upcoming webinar. Highlights key benefits and speaker credibility.',
    thumbnailUrl: '/placeholder.svg',
    createdAt: '2024-06-01T11:30:00Z',
    tags: ['Webinar', 'Lead Generation', 'Engagement'],
    category: 'Lead Generation',
    contentPreview: 'Webinar Title & Promise -> Key Learning Outcomes -> Speaker Intro -> Social Proof -> What You Will Discover -> Bonus for Attending -> CTA (Register Now)',
  },
  {
    id: 'vsl-template-003',
    name: 'SaaS Feature Explainer VSL',
    description: 'Clearly demonstrate the value and functionality of a specific SaaS feature to drive adoption and upgrades.',
    thumbnailUrl: '/placeholder.svg',
    createdAt: '2024-06-20T14:00:00Z',
    tags: ['SaaS', 'Feature Explainer', 'Product Marketing'],
    category: 'Product',
    contentPreview: 'Feature Hook -> Problem Solved by Feature -> Feature Demo (How it Works) -> Key Benefits -> Use Cases -> CTA (Try Feature/Upgrade)',
  },
  {
    id: 'vsl-template-004',
    name: 'Free Consultation Offer VSL',
    description: 'Generate qualified leads by offering a free consultation. Builds trust and positions you as an expert.',
    thumbnailUrl: '/placeholder.svg',
    createdAt: '2024-07-05T16:45:00Z',
    tags: ['Consulting', 'Lead Generation', 'Service'],
    category: 'Lead Generation',
    contentPreview: 'Identify Target Audience Pain -> Introduce Your Expertise -> Value of Consultation -> What They Will Get -> Case Study Snippet -> CTA (Book Free Call)',
  },
    {
    id: 'vsl-template-005',
    name: 'E-commerce Product VSL',
    description: 'Showcase your physical or digital product in action, highlighting benefits and driving immediate sales for e-commerce stores.',
    thumbnailUrl: '/placeholder.svg',
    createdAt: '2024-07-12T10:15:00Z',
    tags: ['E-commerce', 'Product Demo', 'Sales'],
    category: 'E-commerce',
    contentPreview: 'Product Showcase (Visuals) -> Unique Selling Proposition -> Benefits in Action -> Customer Testimonials/Reviews -> Special Offer -> CTA (Shop Now)',
  },
];

export async function GET() {
  const delay = Math.random() * 500 + 800; // 0.8 to 1.3 seconds delay
  // The existing frontend page seems to expect responseData.data.templates
  // Let's provide it in that structure for compatibility for now.
  const responseData = {
    templates: mockVSLTemplates
  };
  const data = await createMockApiResponse(responseData, delay);
  return NextResponse.json({ data }); // Wrapping in { data: ... }
}
