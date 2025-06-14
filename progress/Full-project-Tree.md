```
sikry-frontend_V22
├─ .specstory
│  └─ history
│     └─ 2025-06-05_13-56-help-me-fix-this.md
├─ Building-Plan.md
├─ README.md
├─ app
│  ├─ (auth)
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  └─ signup
│  │     └─ page.tsx
│  ├─ (dashboard)
│  │  ├─ admin
│  │  │  ├─ anti-spam
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ billing
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ compliance
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ monitoring
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ security
│  │  │  │  └─ page.tsx
│  │  │  ├─ team
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  └─ users
│  │  │     └─ page.tsx
│  │  ├─ analytics
│  │  │  ├─ loading.tsx
│  │  │  └─ page.tsx
│  │  ├─ comms
│  │  │  ├─ bulk-sender
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ campaigns
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ templates
│  │  │     ├─ loading.tsx
│  │  │     └─ page.tsx
│  │  ├─ companies
│  │  │  ├─ [id]
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ tabs
│  │  │  │     ├─ ConfigTab.tsx
│  │  │  │     ├─ EngagementTab.tsx
│  │  │  │     ├─ InsightsTab.tsx
│  │  │  │     └─ OverviewTab.tsx
│  │  │  ├─ loading.tsx
│  │  │  └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ financial
│  │  │  ├─ loading.tsx
│  │  │  └─ page.tsx
│  │  ├─ funnels
│  │  │  ├─ loading.tsx
│  │  │  └─ page.tsx
│  │  ├─ gap-analysis
│  │  │  ├─ loading.tsx
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ lead-response
│  │  │  └─ page.tsx
│  │  ├─ market-intel
│  │  │  └─ page.tsx
│  │  ├─ scrapers
│  │  │  ├─ [id]
│  │  │  │  └─ configure
│  │  │  │     └─ page.tsx
│  │  │  ├─ new
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  └─ page.tsx
│  │  ├─ search
│  │  │  ├─ components
│  │  │  │  ├─ QueryExamples.tsx
│  │  │  │  └─ ScopeBadges.tsx
│  │  │  ├─ loading.tsx
│  │  │  └─ page.tsx
│  │  ├─ settings
│  │  │  ├─ ParametersPage.tsx
│  │  │  └─ page.tsx
│  │  ├─ statistics
│  │  │  ├─ CollectionTrends.tsx
│  │  │  ├─ GeographicDistribution.tsx
│  │  │  ├─ SectorDistribution.tsx
│  │  │  ├─ SourceComparison.tsx
│  │  │  ├─ StatisticsPage.tsx
│  │  │  ├─ exports
│  │  │  │  └─ page.tsx
│  │  │  └─ page.tsx
│  │  └─ vsl
│  │     └─ templates
│  │        └─ page.tsx
│  ├─ (marketing)
│  │  ├─ features
│  │  │  ├─ loading.tsx
│  │  │  └─ page.tsx
│  │  └─ pricing
│  │     ├─ loading.tsx
│  │     └─ page.tsx
│  ├─ api
│  │  ├─ activity
│  │  │  └─ recent
│  │  │     ├─ route.test.ts
│  │  │     └─ route.ts
│  │  ├─ analytics
│  │  │  └─ dashboard
│  │  │     ├─ route.test.ts
│  │  │     └─ route.ts
│  │  ├─ auth
│  │  │  └─ logout
│  │  │     └─ route.ts
│  │  ├─ comms
│  │  │  ├─ campaigns
│  │  │  │  └─ route.ts
│  │  │  ├─ send
│  │  │  │  └─ route.ts
│  │  │  └─ templates
│  │  │     └─ route.ts
│  │  ├─ communications
│  │  │  └─ route.ts
│  │  ├─ companies
│  │  │  ├─ [id]
│  │  │  │  └─ route.ts
│  │  │  ├─ bulk-import
│  │  │  │  └─ route.ts
│  │  │  ├─ enrich
│  │  │  │  └─ route.ts
│  │  │  └─ route.ts
│  │  ├─ docs
│  │  │  ├─ route.ts
│  │  │  └─ spec
│  │  │     └─ route.ts
│  │  ├─ financial
│  │  │  ├─ campaign-roi
│  │  │  │  └─ route.ts
│  │  │  ├─ records
│  │  │  │  └─ route.ts
│  │  │  └─ summary
│  │  │     └─ route.ts
│  │  ├─ funnels
│  │  │  ├─ [id]
│  │  │  │  └─ progress
│  │  │  │     └─ route.ts
│  │  │  └─ route.ts
│  │  ├─ gap-analysis
│  │  │  ├─ [id]
│  │  │  │  └─ generate-letter
│  │  │  │     └─ route.ts
│  │  │  └─ route.ts
│  │  ├─ jobs
│  │  │  └─ schedule
│  │  │     └─ route.ts
│  │  ├─ lead-response
│  │  │  ├─ queue
│  │  │  │  └─ route.ts
│  │  │  └─ rules
│  │  │     └─ route.ts
│  │  ├─ market-intel
│  │  │  └─ competitor-analysis
│  │  │     └─ route.ts
│  │  ├─ monitoring
│  │  │  ├─ health
│  │  │  │  └─ route.ts
│  │  │  └─ metrics
│  │  │     └─ route.ts
│  │  ├─ notifications
│  │  │  └─ route.ts
│  │  ├─ reengagement
│  │  │  ├─ classify-leads
│  │  │  │  └─ route.ts
│  │  │  └─ tasks
│  │  │     └─ route.ts
│  │  ├─ referrals
│  │  │  └─ route.ts
│  │  ├─ reviews
│  │  │  └─ requests
│  │  │     └─ route.ts
│  │  ├─ scrapers
│  │  │  ├─ [id]
│  │  │  │  ├─ runs
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ schedule
│  │  │  │     └─ route.ts
│  │  │  ├─ execute
│  │  │  │  └─ route.ts
│  │  │  ├─ route.ts
│  │  │  └─ v2
│  │  │     ├─ detect-fields
│  │  │     │  └─ route.ts
│  │  │     ├─ execute
│  │  │     │  └─ route.ts
│  │  │     └─ test-selector
│  │  │        └─ route.ts
│  │  ├─ search
│  │  │  ├─ natural
│  │  │  │  └─ route.ts
│  │  │  ├─ route.ts
│  │  │  └─ suggestions
│  │  │     └─ route.ts
│  │  ├─ user
│  │  │  └─ route.ts
│  │  ├─ vsl
│  │  │  ├─ pages
│  │  │  │  └─ route.ts
│  │  │  └─ track
│  │  │     └─ route.ts
│  │  └─ webhooks
│  │     ├─ external
│  │     │  └─ route.ts
│  │     └─ internal
│  │        └─ route.ts
│  ├─ error.tsx
│  ├─ globals.css
│  ├─ itsownglobals.css
│  ├─ layout.tsx
│  ├─ loading.tsx
│  ├─ my-account
│  │  ├─ page.tsx
│  │  └─ settings
│  │     └─ page.tsx
│  ├─ not-found.tsx
│  ├─ notdashboard
│  │  ├─ layout.tsx
│  │  ├─ loading.tsx
│  │  └─ page.tsx
│  ├─ page.tsx
│  ├─ profile
│  │  └─ page.tsx
│  └─ search
│     └─ results
│        ├─ loading.tsx
│        └─ page.tsx
├─ components
│  ├─ ai
│  │  └─ AIAssistant.tsx
│  ├─ analytics
│  │  ├─ RealTimeMetrics.tsx
│  │  └─ VSLAnalyticsDashboard.tsx
│  ├─ collaboration
│  │  └─ TeamActivity.tsx
│  ├─ comms
│  │  ├─ CampaignTracker.tsx
│  │  ├─ CampaignsTable.tsx
│  │  ├─ ChannelSelector.tsx
│  │  ├─ ComplianceBadge.tsx
│  │  ├─ SpamShieldBadge.tsx
│  │  ├─ TemplateBuilder.tsx
│  │  └─ notCampaignsTable.tsx
│  ├─ comms-channel-selector.tsx
│  ├─ communications
│  │  └─ CommunicationsTable.tsx
│  ├─ company
│  │  ├─ CompanyHeader.tsx
│  │  ├─ ConfidenceBadge.tsx
│  │  ├─ DataFieldPill.tsx
│  │  └─ EngagementTimeline.tsx
│  ├─ company-card.tsx
│  ├─ confidence-meter.tsx
│  ├─ core
│  │  ├─ branding
│  │  │  └─ Logo.tsx
│  │  ├─ error
│  │  │  └─ ErrorBoundary.tsx
│  │  ├─ feedback
│  │  │  ├─ Toast.tsx
│  │  │  └─ ToastProvider.tsx
│  │  ├─ layout
│  │  │  ├─ AppShell.tsx
│  │  │  └─ SectionContainer.tsx
│  │  ├─ loading
│  │  │  ├─ LoadingSpinner.tsx
│  │  │  └─ PageLoader.tsx
│  │  ├─ navigation
│  │  │  ├─ Breadcrumbs.tsx
│  │  │  ├─ LanguageSelector.tsx
│  │  │  ├─ SecondaryMenuBar.md
│  │  │  ├─ SecondaryMenuBar.tsx
│  │  │  ├─ SidebarNav.tsx
│  │  │  ├─ TopNav.tsx
│  │  │  └─ notTopNav.tsx
│  │  ├─ theme
│  │  │  └─ ThemeToggle.tsx
│  │  └─ typography
│  │     ├─ Heading.tsx
│  │     └─ Text.tsx
│  ├─ data
│  │  ├─ DataQualityScore.tsx
│  │  ├─ cards
│  │  │  ├─ CompanyCard.tsx
│  │  │  └─ IntelCard.tsx
│  │  ├─ tables
│  │  │  └─ DataTable.tsx
│  │  └─ visualizations
│  │     ├─ ScoreGauge.tsx
│  │     └─ TrendChart.tsx
│  ├─ data-field-pill.tsx
│  ├─ engagement-timeline.tsx
│  ├─ financial
│  │  └─ FinancialSummaryPanel.tsx
│  ├─ funnels
│  │  ├─ FunnelBuilder.tsx
│  │  └─ FunnelProgressDashboard.tsx
│  ├─ gap-analysis
│  │  └─ GapAnalysisForm.tsx
│  ├─ insights
│  │  └─ SmartInsights.tsx
│  ├─ interview
│  │  └─ ScheduleMeeting.tsx
│  ├─ lead-response
│  │  └─ LeadResponseRulesManager.tsx
│  ├─ market
│  │  ├─ CompetitorMatrix.tsx
│  │  ├─ LeadScoreCard.tsx
│  │  └─ RelationshipGraph.tsx
│  ├─ notifications
│  │  └─ NotificationCenter.tsx
│  ├─ onboarding
│  │  └─ QuickStartGuide.tsx
│  ├─ reengagement
│  │  └─ LeadClassificationPanel.tsx
│  ├─ referrals
│  │  └─ ReferralDashboard.tsx
│  ├─ reviews
│  │  └─ ReviewBoosterPanel.tsx
│  ├─ scraping
│  │  ├─ AISelector.tsx
│  │  ├─ FieldDetector.tsx
│  │  ├─ ScrapePreview.tsx
│  │  ├─ SelectorTester.tsx
│  │  └─ V2ScraperEditor.tsx
│  ├─ search
│  │  ├─ MapView.tsx
│  │  ├─ ResultsGrid.tsx
│  │  └─ SmartSearchBar.tsx
│  ├─ smart-search-bar.tsx
│  ├─ theme-provider.tsx
│  ├─ ui
│  │  ├─ accordion.tsx
│  │  ├─ alert-dialog.tsx
│  │  ├─ alert.tsx
│  │  ├─ aspect-ratio.tsx
│  │  ├─ avatar.tsx
│  │  ├─ badge.tsx
│  │  ├─ breadcrumb.tsx
│  │  ├─ button.tsx
│  │  ├─ calendar.tsx
│  │  ├─ card.tsx
│  │  ├─ carousel.tsx
│  │  ├─ chart.tsx
│  │  ├─ checkbox.tsx
│  │  ├─ collapsible.tsx
│  │  ├─ command.tsx
│  │  ├─ context-menu.tsx
│  │  ├─ dialog.tsx
│  │  ├─ drawer.tsx
│  │  ├─ dropdown-menu.tsx
│  │  ├─ fixed-pagination.tsx
│  │  ├─ form.tsx
│  │  ├─ hover-card.tsx
│  │  ├─ input-otp.tsx
│  │  ├─ input.tsx
│  │  ├─ label.tsx
│  │  ├─ menubar.tsx
│  │  ├─ navigation-menu.tsx
│  │  ├─ pagination.tsx
│  │  ├─ popover.tsx
│  │  ├─ progress.tsx
│  │  ├─ radio-group.tsx
│  │  ├─ resizable.tsx
│  │  ├─ scroll-area.tsx
│  │  ├─ select.tsx
│  │  ├─ separator.tsx
│  │  ├─ sheet.tsx
│  │  ├─ sidebar.tsx
│  │  ├─ skeleton.tsx
│  │  ├─ slider.tsx
│  │  ├─ sonner.tsx
│  │  ├─ switch.tsx
│  │  ├─ table.tsx
│  │  ├─ tabs.tsx
│  │  ├─ textarea.tsx
│  │  ├─ toast.tsx
│  │  ├─ toaster.tsx
│  │  ├─ toggle-group.tsx
│  │  ├─ toggle.tsx
│  │  ├─ tooltip.tsx
│  │  ├─ unified-search.tsx
│  │  ├─ use-mobile.tsx
│  │  └─ use-toast.ts
│  ├─ vsl
│  │  └─ VSLPageBuilder.tsx
│  └─ workflow
│     └─ WorkflowBuilder.tsx
├─ components.json
├─ features
│  ├─ comms-engine
│  │  ├─ deliverability
│  │  │  └─ spamCheck.ts
│  │  └─ hooks
│  │     └─ useMessageSender.ts
│  ├─ company-intel
│  │  ├─ hooks
│  │  │  └─ useCompanyData.ts
│  │  └─ utils
│  │     └─ enrichment.ts
│  ├─ market-intel
│  │  ├─ hooks
│  │  │  └─ useCompetitorAnalysis.ts
│  │  └─ utils
│  │     └─ scoring.ts
│  ├─ scraping-engine
│  │  ├─ hooks
│  │  │  └─ useScrapePreview.ts
│  │  ├─ legacy
│  │  │  ├─ playwrightAdapter.ts
│  │  │  └─ regexPatterns.ts
│  │  └─ utils
│  │     └─ fieldDetection.ts
│  └─ search-engine
│     ├─ hooks
│     │  └─ useNaturalLanguage.ts
│     ├─ types.ts
│     └─ utils
│        └─ queryParser.ts
├─ hooks
│  ├─ use-mobile.tsx
│  └─ use-toast.ts
├─ lib
│  ├─ actions
│  │  ├─ campaigns.ts
│  │  ├─ communications.ts
│  │  ├─ companies.ts
│  │  └─ scrapers.ts
│  ├─ api
│  │  ├─ commsClient.ts
│  │  ├─ companyClient.ts
│  │  ├─ scrapingClient.ts
│  │  └─ searchClient.ts
│  ├─ constants
│  │  ├─ emailTemplates.ts
│  │  ├─ enums.ts
│  │  ├─ regex.ts
│  │  ├─ routes.ts
│  │  ├─ scraperTemplates.ts
│  │  └─ vslTemplates.ts
│  ├─ docs
│  │  └─ swagger.ts
│  ├─ hooks
│  │  ├─ useAuth.ts
│  │  ├─ useConfig.ts
│  │  ├─ useRealtime.ts
│  │  └─ useResponsive.ts
│  ├─ i18n
│  │  ├─ config.ts
│  │  ├─ translations.ts
│  │  └─ useTranslation.tsx
│  ├─ monitoring
│  │  ├─ logger.ts
│  │  └─ metrics.ts
│  ├─ security
│  │  ├─ encryption.ts
│  │  ├─ inputSanitizer.ts
│  │  └─ rateLimiter.ts
│  ├─ storage
│  │  └─ manager.ts
│  ├─ utils
│  │  ├─ formatters
│  │  │  ├─ currencyFormatter.ts
│  │  │  └─ dateFormatter.ts
│  │  ├─ scraping
│  │  │  ├─ fallbackUtils.ts
│  │  │  └─ v2Adapter.ts
│  │  └─ security
│  │     ├─ encryption.ts
│  │     └─ sanitizer.ts
│  ├─ utils.ts
│  └─ webhooks
│     └─ manager.ts
├─ middleware.ts
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ providers
│  ├─ AuthProvider.tsx
│  ├─ ThemeProvider.tsx
│  ├─ TranslationProvider.tsx
│  └─ notAuthProvider.tsx
├─ public
│  ├─ favicon.ico
│  ├─ fonts
│  │  └─ inter.css
│  ├─ manifest.json
│  ├─ placeholder-logo.png
│  ├─ placeholder-logo.svg
│  ├─ placeholder-user.jpg
│  ├─ placeholder.jpg
│  └─ placeholder.svg
├─ schema.sql
├─ scripts
│  ├─ 001-financial-records.sql
│  ├─ 002-reengagement-engine.sql
│  ├─ 003-referral-system.sql
│  ├─ 004-review-booster.sql
│  ├─ 005-ai-call-assistant.sql
│  ├─ 006-lead-funnel-automation.sql
│  ├─ 007-ai-sales-letter-generator.sql
│  ├─ 008-meta-ad-vsl-system.sql
│  ├─ 009-instant-lead-response.sql
│  └─ 010-fix-companies-rls.sql
├─ stores
│  ├─ commsStore.ts
│  ├─ companyStore.ts
│  └─ searchStore.ts
├─ styles
│  ├─ design-system
│  │  ├─ components.css
│  │  └─ variables.css
│  ├─ itsownglobals.css
│  └─ themes
│     ├─ dark.css
│     └─ light.css
├─ tailwind.config.ts
├─ tsconfig.json
├─ types
│  ├─ api.d.ts
│  ├─ comms.d.ts
│  ├─ company.d.ts
│  ├─ database.ts
│  ├─ financial.ts
│  ├─ funnels.ts
│  ├─ gap-analysis.ts
│  ├─ lead-response.ts
│  ├─ market.d.ts
│  ├─ reengagement.ts
│  ├─ referral.ts
│  ├─ reviews.ts
│  ├─ scraping.d.ts
│  ├─ supabase.d.ts
│  └─ vsl.ts
└─ utils
   └─ supabase
      ├─ client.ts
      └─ server.ts

```