import { NextResponse } from 'next/server';
import { createMockApiResponse } from '@/utils/mockApiUtils';

interface Letter {
  id: string;
  title: string;
  subject: string;
  body: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'archived';
  recipientName: string;
  recipientCompany: string;
}

const mockLetters: Letter[] = [
  {
    id: 'letter-001',
    title: 'Initial Outreach - Tech Solutions',
    subject: 'Exploring Synergies: Innovative Tech Solutions for [Company Name]',
    body: 'Dear [Contact Person],\n\nI hope this email finds you well.\n\nOur records indicate that [Company Name] is a leader in the [Industry] sector, and we at [Your Company] believe our innovative tech solutions could significantly enhance your operational efficiency and market reach...\n\n[Full Body Here]\n\nSincerely,\n[Your Name]',
    createdAt: '2024-07-15T10:30:00Z',
    status: 'draft',
    recipientName: 'Alice Wonderland',
    recipientCompany: 'Future Systems Inc.',
  },
  {
    id: 'letter-002',
    title: 'Follow-up on SaaS Demo',
    subject: 'Following Up: SaaS Platform Demo & Next Steps',
    body: 'Hi [Contact Person],\n\nThank you for your time during the demo of our SaaS platform yesterday. We were excited to show you how [Product Feature] and [Another Feature] can help [Company Name] achieve [Benefit]...\n\n[Full Body Here]\n\nBest regards,\n[Your Name]',
    createdAt: '2024-07-10T14:00:00Z',
    status: 'sent',
    recipientName: 'Bob The Builder',
    recipientCompany: 'Constructive Solutions LLC',
  },
  {
    id: 'letter-003',
    title: 'Partnership Proposal - Marketing Services',
    subject: 'Partnership Opportunity: Elevate Your Marketing Strategy',
    body: 'Dear [Contact Person],\n\n[Your Company] has been impressed by [Company Name]\'s recent work in [Specific Area]. We specialize in providing cutting-edge marketing services that could complement your efforts and drive further growth...\n\n[Full Body Here]\n\nWarmly,\n[Your Name]',
    createdAt: '2024-06-28T09:00:00Z',
    status: 'archived',
    recipientName: 'Charlie Brown',
    recipientCompany: 'Good Grief Co.',
  },
  {
    id: 'letter-004',
    title: 'Post-Conference Networking',
    subject: 'Connecting After [Conference Name]',
    body: 'Hello [Contact Person],\n\nIt was a pleasure connecting with you at [Conference Name] last week. I particularly enjoyed our conversation about [Topic Discussed]. At [Your Company], we are working on [Related Project/Service] which I believe could be of interest to [Company Name]...\n\n[Full Body Here]\n\nRegards,\n[Your Name]',
    createdAt: '2024-07-18T11:00:00Z',
    status: 'draft',
    recipientName: 'Diana Prince',
    recipientCompany: 'Themyscira Corp.',
  },
];

export async function GET() {
  // Simulate a network delay of 1.5 to 2.5 seconds
  const delay = Math.random() * 1000 + 1500;
  const data = await createMockApiResponse(mockLetters, delay);
  return NextResponse.json(data);
}
