# S-I-K-R-Y - AI-Powered Business Intelligence Platform

A comprehensive business intelligence platform that helps you discover, analyze, and engage with businesses using AI-powered search and data extraction.

## Features

### 🔍 Smart Search & Discovery
- **Natural Language Search**: AI-powered query understanding with fallback mechanisms
- **Multi-Source Data Aggregation**: Integration with public business registries and open data sources
- **Real-time Search Suggestions**: Intelligent autocomplete and query examples
- **Advanced Filtering**: Industry, location, confidence score, and data availability filters
- **Pagination & Caching**: Redis-powered search result caching with efficient pagination
- **Grid/List View Toggle**: Flexible result display options

### 🏢 Company Intelligence
- **Automated Data Extraction**: AI-powered field detection and data enrichment
- **Contact Information Detection**: Emails, phones, addresses with confidence scoring
- **Technology Stack Identification**: Automated tech stack detection
- **Company Relationship Mapping**: Visual relationship graphs and connections
- **Data Quality Metrics**: Confidence scoring and data validation

### 📧 Unified Communications Hub
- **Multi-Channel Outreach**: Email, SMS, WhatsApp integration
- **Template Management**: AI-enhanced template library and customization
- **Campaign Tracking**: Real-time delivery and engagement analytics
- **Compliance Monitoring**: CAN-SPAM/GDPR compliance indicators
- **Bulk Sender**: Mass communication with rate limiting

### 📊 Market Intelligence & Analytics
- **Competitor Analysis**: Feature comparison matrices and positioning
- **Lead Scoring**: AI-powered prospect rating algorithms
- **Market Trend Analysis**: Industry insights and trend visualization
- **Geographic Distribution**: Location-based market analysis
- **Sector Distribution**: Industry breakdown and insights

### 🤖 AI-Powered Scrapers
- **V2 Scraper Editor**: Natural language configuration interface
- **Automated Field Detection**: AI-powered field identification
- **Real-time Preview**: Live scraping preview and testing
- **High-Accuracy Extraction**: Advanced data extraction algorithms

### 🎯 Lead Management & Automation
- **Lead Response System**: Automated lead qualification and routing
- **Reengagement Automation**: AI-powered lead reclassification
- **Funnel Builder**: Visual funnel creation and automation
- **Gap Analysis**: AI-generated sales letter creation

### 📈 Financial Intelligence
- **Campaign ROI Tracking**: Return on investment analytics
- **Financial Records**: Revenue and expense tracking
- **Financial Summary**: Comprehensive financial dashboards

### 🔄 Referral & Review Systems
- **Referral Tracking**: Automated referral program management
- **Review Booster**: AI-powered review generation and management
- **Rewards System**: Automated reward distribution

### 📋 VSL (Video Sales Letter) System
- **VSL Builder**: Drag-and-drop video sales letter creation
- **Page Templates**: Pre-built VSL templates
- **Tracking & Analytics**: VSL performance metrics

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 3.4 with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React
- **State Management**: Zustand with persistence
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts and Chart.js
- **Internationalization**: i18next with react-i18next

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis with ioredis client
- **Authentication**: Supabase Auth with SSR support
- **API**: Next.js API Routes with rate limiting
- **AI Services**: OpenAI GPT-4, Google Generative AI
- **File Storage**: Supabase Storage

### Development & Testing
- **Testing**: Playwright (E2E), Jest (Unit), Vitest
- **Linting**: ESLint with Next.js config
- **Build Tool**: Next.js with Turbopack
- **Package Manager**: npm

### Design System
- **Colors**: Custom HSL-based color system with dark mode support
- **Typography**: Inter font family
- **Spacing**: 8px base unit system
- **Components**: Modular component library with accessibility support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- **Redis** (for search caching and pagination)

### Installation

1. **Install Redis** (required for search functionality):
   ```bash
   # On macOS
   brew install redis
   brew services start redis
   
   # On Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis-server
   
   # On Windows
   # Download from https://redis.io/download
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/your-org/sikry-frontend.git
   cd sikry-frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

Edit `.env.local` with your configuration values.

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Architecture

### Search System
The search system uses a multi-layered approach:
1. **Query Parsing**: OpenAI-powered natural language understanding
2. **Cache Layer**: Redis-based result caching with TTL
3. **Data Sources**: Public business registries and open data APIs
4. **Rate Limiting**: Flexible rate limiting with Supabase
5. **Pagination**: Efficient server-side pagination with cache keys

### Data Flow
```
User Query → Query Parser → Cache Check → Data Sources → Enrichment → Cache Store → Results
```

### Security Features
- **Row Level Security (RLS)**: Database-level access control
- **Rate Limiting**: API endpoint protection
- **Input Sanitization**: XSS and injection prevention
- **JWT Authentication**: Secure session management

## Development

### Code Style
- Use TypeScript for all components
- Follow React best practices
- Use Tailwind CSS for styling
- Implement responsive design mobile-first
- Follow accessibility guidelines (WCAG 2.1 AA)

### Component Guidelines
- Create reusable, composable components
- Use proper TypeScript interfaces
- Include accessibility attributes
- Follow the established design system

### Testing
The project includes comprehensive testing across multiple levels:

**E2E Tests (Playwright):**
```bash
npm run test
# or
yarn test
```

**Unit Tests (Jest):**
```bash
npm run test:unit
# or
yarn test:unit
```

**Search-specific Tests:**
```bash
npm run test:search
```

### Building for Production
```bash
npm run build
# or
yarn build
```

## Deployment

The application is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables

See `.env.example` for all required environment variables:

- **Application**: Basic app configuration
- **API**: Backend API endpoints and keys
- **Database**: Supabase connection strings
- **Authentication**: Supabase Auth configuration
- **External APIs**: OpenAI, Google AI, and other service keys
- **Redis**: Cache configuration
- **Monitoring**: Analytics and logging settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@sikry.com or join our Slack channel.

---

Built using Next.js and modern web technologies
