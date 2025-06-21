# Search-Scraper Integration Plan

**Created:** 2025-01-27  
**Last Updated:** 2025-01-27  
**Status:** Planning Phase  
**Priority:** High  

---

## 🤖 Agent Rules
IMPORTANT: These rules must never be deleted and must be referenced before any action:

1. **Always verify file existence before creation** using appropriate tools
2. **Update this progress file after EVERY significant change:**
   - Move completed items to "Completed ✅" section
   - Add new tasks to "Next Steps 📝" section
   - Update "In Progress 🚧" with current tasks
3. **Each update must maintain clear tracking of:**
   - What was just completed
   - What is currently being worked on
   - What should be done next
4. **Never remove completed items** - they serve as implementation history
5. **All new implementations must be production-minded.** Mock data and placeholders must be avoided in favor of real API integrations and robust error handling
6. **Follow SaaS best practices:**
   - Implement proper rate limiting and quotas
   - Add comprehensive error handling and logging
   - Ensure data security and privacy compliance
   - Use TypeScript for type safety
   - Write unit and integration tests
   - Follow RESTful API design principles
7. **Integration rules:**
   - Never duplicate existing functionality
   - Extend existing components and services
   - Maintain backward compatibility
   - Use existing design patterns and conventions
8. **Performance rules:**
   - Implement proper caching strategies
   - Use pagination for large datasets
   - Optimize database queries
   - Monitor and log performance metrics
9. **Parallel Development Rules:**
   - Each developer works on separate files/modules
   - Use feature branches for all development
   - Coordinate API interface changes in advance
   - Follow established naming conventions
   - Update this plan before starting any task

---

## 👥 Parallel Development Strategy

### **Developer Assignment Matrix**

| Developer | Primary Focus | Secondary Focus | Conflict-Free Files |
|-----------|---------------|-----------------|-------------------|
| **Developer A** | Frontend UI/UX | Search Store | `src/components/search/`, `stores/searchStore.ts` |
| **Developer B** | Backend Services | API Routes | `lib/services/`, `app/api/search/` |
| **Developer C** | Integration Logic | Database/Testing | `lib/integration/`, `tests/`, database migrations |

### **Conflict Prevention Rules**

#### **File Ownership**
- **Developer A:** All files in `src/components/search/` and `stores/`
- **Developer B:** All files in `lib/services/` and `app/api/search/`
- **Developer C:** All files in `lib/integration/` and `tests/`

#### **Shared Interfaces**
- All developers must agree on TypeScript interfaces before implementation
- Use `src/types/integration.ts` for shared types
- Coordinate API endpoint signatures in advance

#### **Branch Strategy**
- Each developer uses feature branches: `feature/dev-a/ui-components`, `feature/dev-b/api-services`, `feature/dev-c/integration-logic`
- Merge to main only after code review and testing
- Use pull requests for all changes

---

## 🎯 Vision & Objectives

### Primary Goal
Transform Sikry's search functionality into an intelligent web discovery and data extraction platform by seamlessly integrating the existing scrapers infrastructure with search results.

### Success Criteria
- Users can discover and scrape websites directly from search results
- Zero friction between search and scraping workflows
- Intelligent auto-detection of scrapable data
- Production-ready, scalable architecture
- Comprehensive error handling and monitoring

---

## 🏗️ Architecture Overview

### Integration Points
```
Search Results → Website Discovery → Scraper Generation → Data Extraction → Enrichment
     ↓              ↓                    ↓                    ↓              ↓
Company Card → Discovery Button → Auto-Generated Config → V2 Scraper → Enhanced Data
```

### Data Flow
1. **Search Phase:** User searches for companies
2. **Discovery Phase:** System identifies websites for discovered companies
3. **Scraping Phase:** Auto-generate scraper configs and execute
4. **Enrichment Phase:** Merge scraped data with search results
5. **Display Phase:** Show enriched data in company cards

---

## 📋 Parallel Implementation Phases

### **Phase 1: Foundation Integration (Week 1-2) - PARALLEL**

#### **Developer A: Frontend Foundation**
**Goal:** Create UI components and extend search store

**Week 1 Tasks:**
- [ ] **Create:** `src/components/search/WebsiteDiscovery.tsx`
- [ ] **Create:** `src/components/search/DiscoveryButton.tsx`
- [ ] **Create:** `src/components/search/ScrapingProgress.tsx`
- [ ] **Extend:** `stores/searchStore.ts` (add discovery state)

**Week 2 Tasks:**
- [ ] **Enhance:** `src/components/company/CompanyCard.tsx` (add discovery button)
- [ ] **Create:** `src/components/search/DiscoveryModal.tsx`
- [ ] **Create:** `src/components/search/EnrichedDataDisplay.tsx`
- [ ] **Add:** Loading states and error handling to all components

**Files to Create/Modify:**
```
src/components/search/
├── WebsiteDiscovery.tsx (NEW)
├── DiscoveryButton.tsx (NEW)
├── ScrapingProgress.tsx (NEW)
├── DiscoveryModal.tsx (NEW)
└── EnrichedDataDisplay.tsx (NEW)

stores/
└── searchStore.ts (MODIFY)

src/components/company/
└── CompanyCard.tsx (MODIFY)
```

#### **Developer B: Backend Services**
**Goal:** Create API endpoints and core services

**Week 1 Tasks:**
- [ ] **Create:** `app/api/search/discover/route.ts`
- [ ] **Create:** `app/api/search/enrich/route.ts`
- [ ] **Create:** `lib/services/websiteDiscovery.ts`
- [ ] **Create:** `lib/services/dataEnrichment.ts`

**Week 2 Tasks:**
- [ ] **Create:** `app/api/search/scraper/route.ts`
- [ ] **Create:** `lib/services/scraperGenerator.ts`
- [ ] **Create:** `lib/services/rateLimiter.ts`
- [ ] **Add:** Error handling and logging to all services

**Files to Create:**
```
app/api/search/
├── discover/route.ts (NEW)
├── enrich/route.ts (NEW)
└── scraper/route.ts (NEW)

lib/services/
├── websiteDiscovery.ts (NEW)
├── dataEnrichment.ts (NEW)
├── scraperGenerator.ts (NEW)
└── rateLimiter.ts (NEW)
```

#### **Developer C: Integration Logic**
**Goal:** Create integration services and database layer

**Week 1 Tasks:**
- [ ] **Create:** `lib/integration/scraperIntegration.ts`
- [ ] **Create:** `lib/integration/discoveryManager.ts`
- [ ] **Create:** Database migration scripts
- [ ] **Create:** `src/types/integration.ts`

**Week 2 Tasks:**
- [ ] **Create:** `lib/integration/dataMerger.ts`
- [ ] **Create:** `lib/integration/cacheManager.ts`
- [ ] **Create:** Unit tests for integration services
- [ ] **Create:** Database indexes and constraints

**Files to Create:**
```
lib/integration/
├── scraperIntegration.ts (NEW)
├── discoveryManager.ts (NEW)
├── dataMerger.ts (NEW)
└── cacheManager.ts (NEW)

src/types/
└── integration.ts (NEW)

database/
├── migrations/
│   ├── 001_add_discovery_tables.sql (NEW)
│   └── 002_add_enrichment_tables.sql (NEW)
└── indexes/
    └── discovery_indexes.sql (NEW)

tests/unit/integration/
├── scraperIntegration.test.ts (NEW)
├── discoveryManager.test.ts (NEW)
└── dataMerger.test.ts (NEW)
```

### **Phase 2: Intelligent Discovery (Week 3-4) - PARALLEL**

#### **Developer A: Advanced UI Components**
**Week 3 Tasks:**
- [ ] **Create:** `src/components/search/DiscoveryResults.tsx`
- [ ] **Create:** `src/components/search/ScraperConfigEditor.tsx`
- [ ] **Enhance:** Discovery modal with preview functionality
- [ ] **Add:** Real-time progress indicators

**Week 4 Tasks:**
- [ ] **Create:** `src/components/search/DataPreview.tsx`
- [ ] **Create:** `src/components/search/ConfidenceIndicator.tsx`
- [ ] **Add:** Keyboard navigation and accessibility
- [ ] **Implement:** Responsive design for mobile

#### **Developer B: Discovery Services**
**Week 3 Tasks:**
- [ ] **Integrate:** Google Search API in `websiteDiscovery.ts`
- [ ] **Create:** `lib/services/relevanceScorer.ts`
- [ ] **Add:** Website validation and scoring
- [ ] **Implement:** Caching for discovery results

**Week 4 Tasks:**
- [ ] **Create:** `lib/services/templateMatcher.ts`
- [ ] **Enhance:** Scraper generation with AI
- [ ] **Add:** Rate limiting and quota management
- [ ] **Implement:** Error recovery mechanisms

#### **Developer C: Data Processing**
**Week 3 Tasks:**
- [ ] **Create:** `lib/integration/dataValidator.ts`
- [ ] **Enhance:** Data merger with conflict resolution
- [ ] **Add:** Data quality scoring
- [ ] **Create:** Integration tests

**Week 4 Tasks:**
- [ ] **Create:** `lib/integration/analyticsTracker.ts`
- [ ] **Enhance:** Cache manager with TTL
- [ ] **Add:** Performance monitoring
- [ ] **Create:** E2E test scenarios

### **Phase 3: Data Enrichment (Week 5-6) - PARALLEL**

#### **Developer A: Enrichment UI**
**Week 5 Tasks:**
- [ ] **Create:** `src/components/search/EnrichmentDashboard.tsx`
- [ ] **Enhance:** Company cards with enriched data
- [ ] **Add:** Data source indicators
- [ ] **Create:** Data comparison views

**Week 6 Tasks:**
- [ ] **Create:** `src/components/search/DataQualityIndicator.tsx`
- [ ] **Add:** Export functionality
- [ ] **Implement:** Data visualization
- [ ] **Add:** User preferences for data display

#### **Developer B: Enrichment Services**
**Week 5 Tasks:**
- [ ] **Enhance:** Data enrichment service
- [ ] **Create:** `lib/services/dataQualityAnalyzer.ts`
- [ ] **Add:** Conflict resolution algorithms
- [ ] **Implement:** Data validation rules

**Week 6 Tasks:**
- [ ] **Create:** `lib/services/exportService.ts`
- [ ] **Add:** Data transformation utilities
- [ ] **Implement:** Batch processing
- [ ] **Add:** Data versioning

#### **Developer C: Analytics & Monitoring**
**Week 5 Tasks:**
- [ ] **Create:** `lib/integration/performanceMonitor.ts`
- [ ] **Enhance:** Analytics tracking
- [ ] **Add:** Error reporting
- [ ] **Create:** Monitoring dashboards

**Week 6 Tasks:**
- [ ] **Create:** `lib/integration/healthChecker.ts`
- [ ] **Add:** Automated testing
- [ ] **Implement:** Alerting system
- [ ] **Create:** Performance benchmarks

### **Phase 4: Advanced Features (Week 7-8) - PARALLEL**

#### **Developer A: Advanced UI Features**
**Week 7 Tasks:**
- [ ] **Create:** `src/components/search/BulkDiscovery.tsx`
- [ ] **Add:** Advanced filtering options
- [ ] **Create:** Custom scraper builder UI
- [ ] **Implement:** Drag-and-drop functionality

**Week 8 Tasks:**
- [ ] **Create:** `src/components/search/AnalyticsDashboard.tsx`
- [ ] **Add:** User onboarding flows
- [ ] **Implement:** Advanced search features
- [ ] **Add:** Mobile app considerations

#### **Developer B: Advanced Services**
**Week 7 Tasks:**
- [ ] **Create:** `lib/services/bulkProcessor.ts`
- [ ] **Add:** Scheduled scraping
- [ ] **Implement:** Custom extraction rules
- [ ] **Add:** Advanced rate limiting

**Week 8 Tasks:**
- [ ] **Create:** `lib/services/notificationService.ts`
- [ ] **Add:** Webhook support
- [ ] **Implement:** API versioning
- [ ] **Add:** Enterprise features

#### **Developer C: Optimization & Testing**
**Week 7 Tasks:**
- [ ] **Optimize:** Database queries
- [ ] **Enhance:** Caching strategies
- [ ] **Add:** Load testing
- [ ] **Implement:** Performance tuning

**Week 8 Tasks:**
- [ ] **Create:** Production deployment scripts
- [ ] **Add:** Security hardening
- [ ] **Implement:** Backup strategies
- [ ] **Create:** Documentation

---

## 🔄 Coordination Points

### **Weekly Sync Meetings**
- **Monday:** Review progress and coordinate interface changes
- **Wednesday:** Mid-week check-in and issue resolution
- **Friday:** Demo completed features and plan next week

### **Shared Interfaces (Coordinate Before Implementation)**
```typescript
// src/types/integration.ts - ALL DEVELOPERS MUST AGREE
interface DiscoveryRequest {
  companyName: string;
  companyType?: string;
  location?: string;
}

interface DiscoveryResponse {
  websites: WebsiteSuggestion[];
  confidence: number;
  searchQuery: string;
}

interface ScrapedData {
  companyName?: string;
  emails: string[];
  phones: string[];
  address?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  // ... other fields
}
```

### **API Endpoint Coordination**
```typescript
// All developers must agree on these signatures
POST /api/search/discover
POST /api/search/enrich
POST /api/search/scraper
GET /api/search/discovery-status/:id
```

### **Database Schema Coordination**
```sql
-- All developers must agree on table structures
CREATE TABLE discovery_requests (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  status VARCHAR(50),
  website_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE scraped_data (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  data JSONB,
  source_url TEXT,
  confidence_score DECIMAL,
  created_at TIMESTAMP
);
```

---

## 🚨 Conflict Prevention Checklist

### **Before Starting Any Task:**
- [ ] Check this plan for file ownership
- [ ] Coordinate with other developers on shared interfaces
- [ ] Create feature branch with descriptive name
- [ ] Update "In Progress" section in this plan

### **Before Pushing Code:**
- [ ] Run all tests locally
- [ ] Check for TypeScript errors
- [ ] Verify no conflicts with other developers' files
- [ ] Update "Completed" section in this plan

### **Before Merging to Main:**
- [ ] Create pull request with detailed description
- [ ] Request code review from other developers
- [ ] Ensure all tests pass in CI/CD
- [ ] Update documentation if needed

---

## 📊 Progress Tracking

### **Developer A Progress**
- **Week 1:** [ ] [ ] [ ] [ ] (4 tasks)
- **Week 2:** [ ] [ ] [ ] [ ] (4 tasks)
- **Week 3:** [ ] [ ] [ ] [ ] (4 tasks)
- **Week 4:** [ ] [ ] [ ] [ ] (4 tasks)

### **Developer B Progress**
- **Week 1:** [ ] [ ] [ ] [ ] (4 tasks)
- **Week 2:** [ ] [ ] [ ] [ ] (4 tasks)
- **Week 3:** [ ] [ ] [ ] [ ] (4 tasks)
- **Week 4:** [ ] [ ] [ ] [ ] (4 tasks)

### **Developer C Progress**
- **Week 1:** [ ] [ ] [ ] [ ] (4 tasks)
- **Week 2:** [ ] [ ] [ ] [ ] (4 tasks)
- **Week 3:** [ ] [ ] [ ] [ ] (4 tasks)
- **Week 4:** [ ] [ ] [ ] [ ] (4 tasks)

---

## 🎯 Success Metrics

### **Individual Developer Metrics**
- **Task Completion Rate:** >90%
- **Code Quality:** No TypeScript errors, all tests passing
- **Conflict Resolution:** <5 merge conflicts per developer
- **Documentation:** All new features documented

### **Team Metrics**
- **Integration Success:** All components work together seamlessly
- **Performance:** <2s response time for discovery requests
- **Reliability:** >99% uptime for new features
- **User Adoption:** >70% of users try discovery features

---

## 🛠️ Technical Implementation Details

### 1. Search Store Extensions

**File:** `stores/searchStore.ts`

```typescript
interface SearchState {
  // ... existing state
  discoveryState: {
    [companyId: string]: {
      status: 'idle' | 'discovering' | 'scraping' | 'completed' | 'error';
      website?: string;
      scraperId?: string;
      scrapedData?: CompanyData;
      error?: string;
    };
  };
}

interface SearchActions {
  // ... existing actions
  discoverWebsite: (companyId: string, companyName: string) => Promise<void>;
  executeScraper: (companyId: string, url: string) => Promise<void>;
  enrichCompanyData: (companyId: string, scrapedData: any) => Promise<void>;
}
```

### 2. Scraper Integration Service

**File:** `lib/services/scraperIntegration.ts`

```typescript
export class ScraperIntegrationService {
  async discoverWebsite(companyName: string): Promise<WebsiteDiscovery> {
    // 1. Search for company website using Google Search API
    // 2. Validate and score results
    // 3. Return best match with confidence score
  }

  async generateScraperConfig(website: string, companyType: string): Promise<ScraperConfig> {
    // 1. Analyze website structure
    // 2. Match with existing templates
    // 3. Generate custom selectors using AI
    // 4. Return optimized config
  }

  async executeScraper(config: ScraperConfig, url: string): Promise<ScrapedData> {
    // 1. Create scraper using existing V2 system
    // 2. Execute scraping job
    // 3. Return structured data
  }
}
```

### 3. API Routes

**File:** `app/api/search/discover/route.ts`

```typescript
export async function POST(request: Request) {
  try {
    const { companyName, companyType } = await request.json();
    
    // 1. Validate input
    // 2. Call discovery service
    // 3. Return website suggestions
  } catch (error) {
    // Comprehensive error handling
  }
}
```

**File:** `app/api/search/enrich/route.ts`

```typescript
export async function POST(request: Request) {
  try {
    const { companyId, scrapedData } = await request.json();
    
    // 1. Validate scraped data
    // 2. Merge with existing company data
    // 3. Update database
    // 4. Return enriched data
  } catch (error) {
    // Comprehensive error handling
  }
}
```

### 4. UI Components

**File:** `src/components/search/WebsiteDiscovery.tsx`

```typescript
interface WebsiteDiscoveryProps {
  companyId: string;
  companyName: string;
  onDiscoveryComplete: (data: ScrapedData) => void;
}

export function WebsiteDiscovery({ companyId, companyName, onDiscoveryComplete }: WebsiteDiscoveryProps) {
  // 1. Discovery button with loading states
  // 2. Website preview modal
  // 3. Scraping progress indicator
  // 4. Results display
}
```

---

## 🎨 UI/UX Design Guidelines

### Design Principles
1. **Progressive Disclosure:** Start simple, reveal advanced features gradually
2. **Consistent Interaction:** Use existing design patterns and components
3. **Clear Feedback:** Provide immediate visual feedback for all actions
4. **Error Prevention:** Validate inputs and provide helpful error messages

### Component Guidelines
- Use existing UI components from `src/components/ui/`
- Follow established color schemes and typography
- Implement responsive design for all screen sizes
- Add proper loading states and skeleton screens

### Accessibility Requirements
- Ensure keyboard navigation support
- Add proper ARIA labels and descriptions
- Maintain color contrast ratios
- Support screen readers

---

## 🔒 Security & Compliance

### Data Protection
- Encrypt all scraped data at rest
- Implement data retention policies
- Ensure GDPR compliance for EU users
- Add data anonymization options

### Rate Limiting
- Respect website robots.txt files
- Implement intelligent delays between requests
- Add user-based scraping quotas
- Monitor and prevent abuse

### Access Control
- Validate user permissions for scraping
- Implement organization-wide limits
- Add audit logging for all scraping activities
- Ensure secure API authentication

---

## 🧪 Testing Strategy

### Unit Tests
- Test all integration service methods
- Validate data transformation logic
- Test error handling scenarios
- Mock external API calls

### Integration Tests
- Test search-to-scraper workflow
- Validate API endpoint responses
- Test data enrichment processes
- Verify caching behavior

### E2E Tests
- Test complete user workflows
- Validate UI interactions
- Test error scenarios
- Verify performance under load

### Test Files Structure
```
tests/
├── integration/
│   ├── scraperIntegration.test.ts
│   ├── websiteDiscovery.test.ts
│   └── dataEnrichment.test.ts
├── e2e/
│   ├── search-to-scraper.spec.ts
│   └── discovery-workflow.spec.ts
└── unit/
    ├── services/
    │   └── scraperIntegration.test.ts
    └── components/
        └── WebsiteDiscovery.test.tsx
```

---

## 📊 Monitoring & Analytics

### Performance Metrics
- Discovery success rate
- Scraping completion time
- Data enrichment accuracy
- API response times

### Business Metrics
- User engagement with discovery features
- Scraping usage patterns
- Data quality improvements
- Feature adoption rates

### Error Tracking
- Discovery failures
- Scraping errors
- API timeouts
- Data validation errors

### Logging Strategy
- Structured logging for all operations
- Error context preservation
- Performance timing logs
- User action tracking

---

## 🚀 Deployment & DevOps

### Environment Configuration
- Separate staging and production environments
- Environment-specific API keys and limits
- Feature flags for gradual rollout
- Monitoring and alerting setup

### Database Migrations
- Add new tables for discovery tracking
- Update existing tables for enrichment
- Implement data migration scripts
- Add proper indexes for performance

### API Versioning
- Maintain backward compatibility
- Version new endpoints appropriately
- Document API changes
- Provide migration guides

---

## 📚 Documentation Requirements

### Technical Documentation
- API endpoint documentation
- Service architecture diagrams
- **Database schema updates** - See `progress/Plan/database-schema-changes.md` for detailed schema changes
- Integration guides

### User Documentation
- Feature usage guides
- Troubleshooting guides
- Best practices documentation
- FAQ sections

### Developer Documentation
- Code style guidelines
- Testing procedures
- Deployment processes
- Contributing guidelines

---

## ✅ Completed Tasks

*No tasks completed yet - this is the initial planning phase*

---

## 🚧 In Progress

*No tasks currently in progress*

---

## 📝 Next Steps

### Immediate Actions (Week 1)
1. **Set up project structure** for integration components
2. **Create integration service** foundation
3. **Extend search store** with discovery state
4. **Add discovery button** to company cards

### Week 2 Goals
1. **Implement website discovery** API endpoint
2. **Create scraper generation** logic
3. **Add basic UI components** for discovery
4. **Write initial tests** for core functionality

### Week 3 Goals
1. **Integrate with existing scrapers** system
2. **Implement data enrichment** service
3. **Add comprehensive error handling**
4. **Create monitoring and logging**

### Week 4 Goals
1. **Optimize performance** and caching
2. **Add advanced features** and customization
3. **Complete testing suite**
4. **Prepare for production deployment**

---

## 🔄 Maintenance & Updates

### Regular Reviews
- Weekly progress reviews
- Monthly performance assessments
- Quarterly feature evaluations
- Annual architecture reviews

### Update Procedures
- Document all changes in this file
- Update version numbers and dates
- Maintain change logs
- Communicate updates to team

### Future Enhancements
- Advanced AI features
- Mobile app integration
- Enterprise features
- API marketplace

---

## 📞 Support & Resources

### Team Contacts
- **Product Owner:** [To be assigned]
- **Tech Lead:** [To be assigned]
- **QA Lead:** [To be assigned]

### External Resources
- **Google Search API Documentation:** [Link]
- **Scraping Best Practices:** [Link]
- **SaaS Security Guidelines:** [Link]

### Tools & Services
- **Monitoring:** [To be configured]
- **Error Tracking:** [To be configured]
- **Analytics:** [To be configured]

---

*This plan will be updated regularly as implementation progresses. All changes must be documented with dates and reasons.* 