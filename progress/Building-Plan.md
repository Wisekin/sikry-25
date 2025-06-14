App name = S-I-K-R-Y (Sikso Intelligent Knowledge Retrieval Ystem

(A "Ystem" = Your system/data ecosystem))

Frontend Requirements Document: AI-Powered Business Intelligence Platform Overview Build a world-first AI-powered business intelligence platform that enables companies to:

Discover businesses using natural language searches

Automatically extract critical data without manual configuration

Engage prospects through unified communication channels

Analyze market intelligence through AI-powered insights

Core User Flows

Natural Language Search graph TD A[Search Bar] --> B(Parse Query) B --> C[Search Engines] C --> D[Company Results] D --> E[Enriched Profiles] Requirements:
Prominent search bar with placeholder: "Find companies: 'Marketing agencies in Geneva'"

Real-time search suggestions as user types

Visual indicators for search scope (Google/LinkedIn/Crunchbase)

Result cards showing company name, domain, location, and confidence score

Company Intelligence Dashboard Components:
Company profile header (logo, name, domain)

Data extraction panel (auto-detected fields)

Engagement history timeline

Relationship mapping (key people/connections)

Data Display: interface CompanyProfile { name: string; domain: string; extractedData: { emails: Contact[]; phones: Contact[]; services: string[]; address: string; technologies: string[]; }; confidenceScore: number; lastScraped: Date; }

Zero-Config Scraping Interface Features:
Auto-detected field visualization (highlighted page elements)

Field confidence indicators (0-100%)

One-click "Verify Accuracy" button

Field management panel:

Add/remove fields

Field type selection (text/email/phone/address)

Custom naming

Unified Communication Hub
graph LR A[Contact] --> B(Email) A --> C(SMS) A --> D(WhatsApp) B --> E[Templates] C --> E D --> E

Requirements:

Multi-channel selector (email/SMS/WhatsApp)

Template library with AI-generated suggestions

Send throttling visualization

Delivery/engagement tracking

CAN-SPAM/GDPR compliance indicators

Market Intelligence Module Visualizations:
Competitor matrix (features/pricing comparison)

Industry trend charts

Lead scoring dashboard

Relationship mapping (org charts) Page Architecture

Search Landing Page Hero section with value proposition
Search bar with example queries

Industry use case cards

Trust indicators (security certifications)

Search Results Page Results filtering panel
Company cards grid

Map view toggle

Export button (CSV/JSON)

Company Detail Page Tabs:

Company Detail Page Tabs:

Overview (extracted data)

Engagement (communication history)

Insights (AI-generated analysis)

Configuration (scraping settings)

Communication Dashboard Contact pipeline visualization
Template management

Campaign performance metrics

Response tracking

Admin Settings Team management
API key generation

Billing portal

Compliance center Performance Metrics Page load: < 2s (LCP)

Search results: < 1s response

Scraping preview: < 3s render

API calls: < 300ms latency

Security Requirements JWT authentication

Field-level encryption for PII

CSP headers

Permission-based component rendering UI/UX Guidelines Design System Primary Colors: Indigo (
#6366f1), Emerald (
#10b981)

Error Palette: Rose (
#f43f5e)

Success Palette: Emerald (
#10b981)

Typography: Inter font family

Spacing: 8px base unit

Accessibility WCAG 2.1 AA compliance

Dark mode support

Keyboard navigation

Screen reader optimization

Responsive Breakpoints

const breakpoints = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' }

Component Library Core Components <SmartSearchBar> - NLP-powered search

<CompanyCard> - Result preview

<DataFieldPill> - Extracted data item

<ConfidenceMeter> - AI confidence visual

<CommsChannelSelector> - Message channel picker

Visualization Components <RelationshipGraph> - Company connections

<CompetitorMatrix> - Feature comparison

<EngagementTimeline> - Communication history

<LeadScoreGauge> - Prospect rating

graph LR F[Frontend] --> A[API Gateway] A --> S[Search Service] A --> D[Data Enrichment] A --> C[Comms Service] A --> I[AI Service]

Endpoints:

POST /api/search - Natural language search

GET /api/companies/:id - Company profile

POST /api/scrape/verify - Field verification

POST /api/comms/send - Message sending

GET /api/comms/templates - Template lis

Deliverables & Timeline Phase 1: MVP Foundations Search landing page

Results page layout

Company card component

Core API integration

Phase 2: Intelligence Features Company detail page

Auto-detection UI

Communication hub

Basic visualizations

Phase 3: Enterprise Refinement Admin settings panel

Permission system

Export functionality

Performance optimization

Success Metrics User Engagement:

5 searches/user/day

3 companies explored/search

Data Quality:

85% field accuracy

< 10% manual corrections

Communication:

60% open rate

< 0.1% spam complaints

rimary Font: Inter (Open Source) Why:

------------- FEatures expansion -----------------
Here is a detailed and comprehensive plan you can follow to implement each key feature without breaking existing functionality and while maintaining modularity, flexibility, and future-proof design.

---

# 🧠 **Comprehensive Functional Plan**

## For Feature Expansion (With No Breaking Changes)

---

### 🧩 **0. Foundation Principles (To Share with Your Dev Team)**

* **No schema modifications to existing tables unless absolutely necessary.**
* New functionality = new tables or modular components.
* Each feature should be **decoupled**, with:

  * Its own database table(s)
  * Background jobs or webhooks when needed
  * React contexts/services for UI modularity
* Use **foreign keys** and **indexes** only when linking to critical entities (like `users`, `organizations`, or `contacts`).
* **Fallbacks** and **fail-safes** for third-party APIs are required.

---

## ✅ 1. **Bookkeeping & Compatibility Layer**

### Goal:

Track revenue, cost, and ROI per campaign, contact, and lead source.

### Backend Plan:

* Add a new table `financial_records` with fields:

  * `id`, `organization_id`, `source_type` (campaign/contact), `source_id`, `amount`, `type` (income/expense), `description`, `timestamp`, `currency`

### Relationships:

* Optional `campaign_id` or `contact_id` as foreign keys.
* Indexed on `organization_id`, `source_id`, and `timestamp`.

### Frontend UI:

* Financial summary component per campaign and contact.
* Compatibility with CSV export.

---

## ✅ 2. **Lead Re-Engagement Engine**

### Goal:

Automatically identify and contact cold leads from your existing database.

### Backend Plan:

* Background job checks for contacts:

  * With `last_contacted_at > X days ago`
  * `engagement_score < Y`
* Queue re-engagement campaigns using existing `campaigns` + `templates`.

### New Table (Optional):

* `reengagement_tasks` to log campaigns triggered by re-engagement logic.

### Frontend UI:

* “Smart Re-Engage” button on the dashboard.
* Lead heatmap (e.g., hot, warm, cold contacts).

---

## ✅ 3. **Referral Mechanism**

### Goal:

Let users refer friends and track who brought who.

### Backend Plan:

* New table `referrals`:

  * `referrer_user_id`, `referred_user_id`, `referred_email`, `referral_code`, `status`

### Relationships:

* Linked to `users` and `organizations`.

### Frontend UI:

* Referral dashboard (list of referrals, invite link, rewards)
* Landing page accepts `?ref=CODE` and passes it to signup

---

## ✅ 4. **Review Booster for Google My Business**

### Goal:

Boost SEO with real reviews at the right time.

### Backend Plan:

* New table `review_requests`:

  * `contact_id`, `campaign_id`, `status`, `review_url`, `sent_at`, `clicked_at`, `review_submitted_at`

### Trigger Logic:

* After appointment or positive interaction → trigger review request campaign

### Frontend UI:

* Show “Request Review” button in contact detail
* Stats on total reviews requested / clicked / completed

---

## ✅ 5. **AI Assistant for Inbound Calls & Appointments**

### Goal:

Reduce human effort for scheduling and info collection via AI.

### Backend Plan:

* New table `call_interactions`:

  * `contact_id`, `transcript`, `intent_detected`, `appointment_scheduled`, `timestamp`
* Integrate with speech-to-text APIs (open-source fallback = Whisper)

### Frontend UI:

* Call logs panel
* Alert if booking failed
* “Smart Assistant Settings” panel for users to configure messages

---

## ✅ 6. **Automated Lead Funnel (Lifecycle + Prequalification)**

### Goal:

Create an automated journey from discovery to booked appointment.

### Backend Plan:

* New table `funnels`:

  * `id`, `name`, `steps` (JSON), `conversion_stats`, `campaign_ids`, `vsl_url`

* Log every lead’s funnel journey in `funnel_progress`:

  * `contact_id`, `funnel_id`, `step_number`, `status`, `timestamp`

### Frontend UI:

* Funnel Builder UI (step name, campaign, trigger)
* Timeline of each lead's journey

---

## ✅ 7. **AI Sales Letter Generator (Gap Analysis)**

### Goal:

Use scraped data + form answers to auto-generate a sales letter.

### Backend Plan:

* New table `gap_analyses`:

  * `contact_id`, `company_id`, `data_snapshot`, `generated_letter`, `score`, `created_at`

* API route to call OpenAI/Claude with prompt + context

### Frontend UI:

* Form for self-assessment
* Dynamic VSL with CTA
* Button to regenerate sales letter

---

## ✅ 8. **Meta Ads Traffic to VSL**

### Goal:

Capture cheap traffic and track performance.

### Backend Plan:

* Use UTM parameters saved to `campaign_recipients` or `communications.metadata`
* New table `ad_clicks` (optional) to log direct traffic source

### Frontend UI:

* Campaign builder includes “Generate VSL Page” button
* Embed Meta Pixel
* Analytics on traffic and conversion

---

## ✅ 9. **Instant Lead Response Automation**

### Goal:

Ensure leads are contacted within 5 mins of arrival.

### Backend Plan:

* Webhook listener or cron task that:

  * Detects new leads (`contacts` or `campaign_recipients`)
  * Immediately sends SMS/email using provider (with fallback logic)
* Add retry logic if provider fails (stored in `background_jobs`)

### Frontend UI:

* Toggle in settings: “Auto-respond to new leads”
* Delay control (default: 5 min)

---

# ✅ Developer Action Plan Summary

| Area                 | Action                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------- |
| **Database**         | Add new feature-specific tables only, no changes to existing ones                        |
| **Backend (API)**    | Create isolated API routes and services per module; use background\_jobs for async logic |
| **Frontend (React)** | Use Contexts for state, modular cards/components for each feature                        |
| **Styling/UI**       | Use Tailwind with Lucide + Radix as planned                                              |
| **Fail-Safes**       | Ensure fallback content or offline workflows if third-party APIs fail                    |

---