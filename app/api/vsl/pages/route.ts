import { NextResponse } from 'next/server';
import { createMockApiResponse } from '@/utils/mockApiUtils';

export interface VSLPage {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  lastUpdatedAt: string;
  previewImageUrl?: string; // Using a generic placeholder for now
  conversionRate?: number;
  views?: number;
  associatedTemplateId?: string;
  templateName?: string; // Added for display
  liveUrl?: string; // For a direct link if published
}

const mockVSLPages: VSLPage[] = [
  {
    id: 'vsl-page-001',
    title: 'Revolutionary SaaS Product Launch',
    status: 'published',
    createdAt: '2024-06-10T10:00:00Z',
    lastUpdatedAt: '2024-07-15T14:30:00Z',
    previewImageUrl: '/placeholder.svg', // General placeholder
    conversionRate: 12.5,
    views: 15230,
    associatedTemplateId: 'template-standard-01',
    templateName: 'Standard Video Lander',
    liveUrl: '#', // Placeholder link
  },
  {
    id: 'vsl-page-002',
    title: 'Exclusive Webinar Sign-up VSL',
    status: 'draft',
    createdAt: '2024-07-01T09:15:00Z',
    lastUpdatedAt: '2024-07-20T11:05:00Z',
    previewImageUrl: '/placeholder.svg',
    conversionRate: 0,
    views: 0,
    associatedTemplateId: 'template-webinar-02',
    templateName: 'Webinar Signup Special',
  },
  {
    id: 'vsl-page-003',
    title: 'Archived Q1 Marketing VSL',
    status: 'archived',
    createdAt: '2024-01-20T16:00:00Z',
    lastUpdatedAt: '2024-03-01T10:00:00Z',
    previewImageUrl: '/placeholder.svg',
    conversionRate: 8.2,
    views: 8500,
    associatedTemplateId: 'template-standard-01',
    templateName: 'Standard Video Lander',
  },
  {
    id: 'vsl-page-004',
    title: 'New Feature Announcement VSL',
    status: 'published',
    createdAt: '2024-07-18T11:30:00Z',
    lastUpdatedAt: '2024-07-19T09:45:00Z',
    previewImageUrl: '/placeholder.svg',
    conversionRate: 15.1,
    views: 5200,
    associatedTemplateId: 'template-feature-03',
    templateName: 'Feature Spotlight',
    liveUrl: '#',
  },
    {
    id: 'vsl-page-005',
    title: 'Limited Time Offer VSL',
    status: 'draft',
    createdAt: '2024-07-22T14:00:00Z',
    lastUpdatedAt: '2024-07-22T16:30:00Z',
    previewImageUrl: '/placeholder.svg',
    conversionRate: 0,
    views: 0,
    associatedTemplateId: 'template-promo-01',
    templateName: 'Urgency Promo Lander',
  },
];

export async function GET() {
  // Simulate a network delay of 1 to 1.5 seconds
  const delay = Math.random() * 500 + 1000;
  // Wrap the response in the expected format
  const responseData = {
    data: {
      pages: mockVSLPages.map(page => ({
        page_id: page.id,
        title: page.title,
        template_name: page.templateName,
        status: page.status,
        stats: {
          views: page.views || 0,
          conversions: Math.round((page.views || 0) * (page.conversionRate || 0) / 100),
          conversion_rate: page.conversionRate || 0
        },
        created_at: page.createdAt,
        live_url: page.liveUrl
      }))
    }
  };
  const data = await createMockApiResponse(responseData, delay);
  return NextResponse.json(data);
}

// We can remove the POST handler for the mock API as it's not needed for this task.
// If a POST request is made, it will naturally 405 (Method Not Allowed) or 404.
