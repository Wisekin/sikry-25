```
sikry-frontend_V23
├─ .cursorindexingignore
├─ .specstory
│  ├─ .what-is-this.md
│  └─ history
│     └─ 2025-06-10_15-45-fix-syntax-error-in-lead-response-page.md
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
│  │  │  ├─ conversion
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ loading.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ performance
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  └─ revenue
│  │  │     ├─ loading.tsx
│  │  │     └─ page.tsx
│  │  ├─ comms
│  │  │  ├─ bulk-sender
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ campaigns
│  │  │  │  ├─ loading.tsx
│  │  │  │  ├─ new
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ templates
│  │  │     ├─ [id]
│  │  │     │  └─ page.tsx
│  │  │     ├─ loading.tsx
│  │  │     ├─ new
│  │  │     │  └─ page.tsx
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
│  │  │  ├─ campaign-roi
│  │  │  │  └─ page.tsx
│  │  │  ├─ loading.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ records
│  │  │  │  └─ page.tsx
│  │  │  └─ summary
│  │  │     └─ page.tsx
│  │  ├─ funnels
│  │  │  ├─ automation
│  │  │  │  └─ page.tsx
│  │  │  ├─ builder
│  │  │  │  └─ page.tsx
│  │  │  ├─ loading.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ progress
│  │  │     └─ page.tsx
│  │  ├─ gap-analysis
│  │  │  ├─ form
│  │  │  │  └─ page.tsx
│  │  │  ├─ letters
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ loading.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ results
│  │  │     ├─ loading.tsx
│  │  │     └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ layout.tsx.bak
│  │  ├─ lead-response
│  │  │  ├─ analytics
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ loading.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ queue
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  └─ rules
│  │  │     ├─ loading.tsx
│  │  │     └─ page.tsx
│  │  ├─ market-intel
│  │  │  └─ page.tsx
│  │  ├─ new-layout.tsx
│  │  ├─ notifications
│  │  │  └─ page.tsx
│  │  ├─ reengagement
│  │  │  ├─ automation
│  │  │  │  └─ page.tsx
│  │  │  ├─ classification
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ tasks
│  │  │     └─ page.tsx
│  │  ├─ referrals
│  │  │  ├─ dashboard
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ rewards
│  │  │  │  └─ page.tsx
│  │  │  └─ tracking
│  │  │     └─ page.tsx
│  │  ├─ reviews
│  │  │  ├─ booster
│  │  │  │  └─ page.tsx
│  │  │  ├─ monitoring
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ requests
│  │  │     └─ page.tsx
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
│  │  │  ├─ collection-trends
│  │  │  │  └─ page.tsx
│  │  │  ├─ exports
│  │  │  │  └─ page.tsx
│  │  │  ├─ geographic-distribution
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ sector-distribution
│  │  │  │  └─ page.tsx
│  │  │  └─ source-comparison
│  │  │     └─ page.tsx
│  │  └─ vsl
│  │     ├─ page.tsx
│  │     ├─ pages
│  │     │  ├─ loading.tsx
│  │     │  └─ page.tsx
│  │     ├─ templates
│  │     │  ├─ loading.tsx
│  │     │  └─ page.tsx
│  │     └─ tracking
│  │        ├─ loading.tsx
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
│  │  │  ├─ conversion
│  │  │  │  └─ route.ts
│  │  │  ├─ dashboard
│  │  │  │  ├─ route.test.ts
│  │  │  │  └─ route.ts
│  │  │  ├─ performance
│  │  │  │  └─ route.ts
│  │  │  └─ revenue
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
│  │  │  ├─ automation
│  │  │  │  └─ route.ts
│  │  │  ├─ builder
│  │  │  │  └─ route.ts
│  │  │  ├─ progress
│  │  │  │  └─ route.ts
│  │  │  └─ route.ts
│  │  ├─ gap-analysis
│  │  │  ├─ [id]
│  │  │  │  └─ generate-letter
│  │  │  │     └─ route.ts
│  │  │  ├─ letters
│  │  │  │  └─ route.ts
│  │  │  ├─ results
│  │  │  │  └─ route.ts
│  │  │  └─ route.ts
│  │  ├─ jobs
│  │  │  └─ schedule
│  │  │     └─ route.ts
│  │  ├─ lead-response
│  │  │  ├─ analytics
│  │  │  │  └─ route.ts
│  │  │  ├─ overview
│  │  │  │  └─ route.ts
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
│  │  │  ├─ automation
│  │  │  │  └─ route.ts
│  │  │  ├─ classify-leads
│  │  │  │  └─ route.ts
│  │  │  └─ tasks
│  │  │     └─ route.ts
│  │  ├─ referrals
│  │  │  ├─ dashboard
│  │  │  │  └─ route.ts
│  │  │  ├─ rewards
│  │  │  │  └─ route.ts
│  │  │  ├─ route.ts
│  │  │  └─ tracking
│  │  │     └─ route.ts
│  │  ├─ reviews
│  │  │  ├─ booster
│  │  │  │  └─ route.ts
│  │  │  ├─ monitoring
│  │  │  │  └─ route.ts
│  │  │  ├─ requests
│  │  │  │  └─ route.ts
│  │  │  └─ route.ts
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
│  │  │  ├─ connection-test
│  │  │  │  └─ route.ts
│  │  │  ├─ natural
│  │  │  │  ├─ new-route.ts
│  │  │  │  └─ route.ts
│  │  │  ├─ route.ts
│  │  │  ├─ suggestions
│  │  │  │  └─ route.ts
│  │  │  └─ test-connection
│  │  │     └─ route.ts
│  │  ├─ statistics
│  │  │  ├─ collection-trends
│  │  │  │  └─ route.ts
│  │  │  ├─ geographic-distribution
│  │  │  │  └─ route.ts
│  │  │  ├─ sector-distribution
│  │  │  │  └─ route.ts
│  │  │  └─ source-comparison
│  │  │     └─ route.ts
│  │  ├─ user
│  │  │  └─ route.ts
│  │  ├─ vsl
│  │  │  ├─ pages
│  │  │  │  └─ route.ts
│  │  │  ├─ templates
│  │  │  │  └─ route.ts
│  │  │  ├─ track
│  │  │  │  └─ route.ts
│  │  │  └─ tracking
│  │  │     └─ route.ts
│  │  └─ webhooks
│  │     ├─ external
│  │     │  └─ route.ts
│  │     └─ internal
│  │        └─ route.ts
│  ├─ dashboard
│  │  └─ admin
│  │     └─ security
│  │        └─ page.tsx
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
│  │  ├─ CommunicationFilters.tsx
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
│  │  │  ├─ EnterprisePageHeader.tsx
│  │  │  └─ SectionContainer.tsx
│  │  ├─ loading
│  │  │  ├─ LoadingSkeleton.tsx
│  │  │  ├─ LoadingSpinner.tsx
│  │  │  └─ PageLoader.tsx
│  │  ├─ navigation
│  │  │  ├─ Breadcrumbs.tsx
│  │  │  ├─ LanguageSelector.tsx
│  │  │  ├─ SecondaryMenuBar.tsx
│  │  │  ├─ SecondaryMenuBar.txt
│  │  │  ├─ SecondaryMenuBarWrapper.tsx
│  │  │  ├─ SecondaryMenuBarWrapper.txt
│  │  │  ├─ SidebarNav.tsx
│  │  │  └─ TopNav.tsx
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
│  │  │  ├─ DataTable.tsx
│  │  │  └─ templateColumns.tsx
│  │  └─ visualizations
│  │     ├─ ScoreGauge.tsx
│  │     └─ TrendChart.tsx
│  ├─ data-field-pill.tsx
│  ├─ data-sources-menu.tsx
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
│  │  ├─ EnhancedSearchBar.tsx
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
│  │  ├─ quality-metric-card.tsx
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
│     │  ├─ useNaturalLanguage.ts
│     │  └─ useNaturalLanguageV2.ts
│     ├─ types.ts
│     └─ utils
│        ├─ externalApis.ts
│        ├─ nlpUtils.ts
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
│  ├─ config
│  │  ├─ external-apis.ts
│  │  └─ openai.ts
│  ├─ constants
│  │  ├─ emailTemplates.ts
│  │  ├─ enums.ts
│  │  ├─ organization.ts
│  │  ├─ regex.ts
│  │  ├─ routes.ts
│  │  ├─ scraperTemplates.ts
│  │  └─ vslTemplates.ts
│  ├─ docs
│  │  └─ swagger.ts
│  ├─ hooks
│  │  ├─ useAuth.ts
│  │  ├─ useConfig.ts
│  │  ├─ useDebounce.ts
│  │  ├─ useRealtime.ts
│  │  └─ useResponsive.ts
│  ├─ i18n
│  │  ├─ config.ts
│  │  ├─ translations.ts
│  │  └─ useTranslation.tsx
│  ├─ monitoring
│  │  ├─ logger.ts
│  │  └─ metrics.ts
│  ├─ search
│  │  ├─ adapters
│  │  │  ├─ adapter.ts
│  │  │  └─ companiesHouse.ts
│  │  └─ queryParser.ts
│  ├─ security
│  │  ├─ encryption.ts
│  │  ├─ inputSanitizer.ts
│  │  └─ rateLimiter.ts
│  ├─ storage
│  │  └─ manager.ts
│  ├─ utils
│  │  ├─ api-rate-limiter.ts
│  │  ├─ cache
│  │  │  ├─ cacheManager.ts
│  │  │  ├─ index.ts
│  │  │  ├─ monitoring.ts
│  │  │  ├─ rateLimiter.ts
│  │  │  └─ searchCache.ts
│  │  ├─ cache.ts
│  │  ├─ data-sources
│  │  │  └─ index.ts
│  │  ├─ formatters
│  │  │  ├─ currencyFormatter.ts
│  │  │  └─ dateFormatter.ts
│  │  ├─ mockApiUtils.ts
│  │  ├─ query-parser.ts
│  │  ├─ scraping
│  │  │  ├─ fallbackUtils.ts
│  │  │  └─ v2Adapter.ts
│  │  └─ security
│  │     ├─ encryption.ts
│  │     └─ sanitizer.ts
│  ├─ utils.ts
│  └─ webhooks
│     └─ manager.ts
├─ middleware
│  └─ searchRateLimit.ts
├─ middleware.ts
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ playwright.config.ts
├─ postcss.config.mjs
├─ progress
│  ├─ Building-Plan.md
│  ├─ Building.Plan-reviewed-Only-Search-feature.md
│  ├─ Full-project-Tree.md
│  ├─ ROAD-MAP.md
│  ├─ progress.md
│  └─ searchbar-feature.md
├─ project-tree.md
├─ providers
│  ├─ AuthProvider.tsx
│  ├─ SupabaseProvider.tsx
│  ├─ ThemeProvider.tsx
│  └─ TranslationProvider.tsx
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
│  ├─ 010-fix-companies-rls.sql
│  ├─ 011-test-companies-rls.sql
│  ├─ 012-api-cache.sql
│  ├─ 013-search-rate-limit.sql
│  ├─ 014-add-metadata-to-api-cache.sql
│  └─ apply-schema.sh
├─ stores
│  ├─ commsStore.ts
│  ├─ companyStore.ts
│  └─ searchStore.ts
├─ stranslation.md
├─ styles
│  ├─ design-system
│  │  ├─ components.css
│  │  └─ variables.css
│  ├─ itsownglobals.css
│  └─ themes
│     ├─ dark.css
│     └─ light.css
├─ tailwind.config.ts
├─ test_cases.md
├─ tests
│  └─ search
│     ├─ cache.test.ts
│     ├─ history.test.ts
│     └─ rate-limit.test.ts
├─ tsconfig.json
├─ types
│  ├─ api.d.ts
│  ├─ comms.d.ts
│  ├─ company.d.ts
│  ├─ database.ts
│  ├─ financial.ts
│  ├─ funnels.ts
│  ├─ gap-analysis.ts
│  ├─ index.ts
│  ├─ lead-response.ts
│  ├─ market.d.ts
│  ├─ reengagement.ts
│  ├─ referral.ts
│  ├─ reviews.ts
│  ├─ scraping.d.ts
│  ├─ search.ts
│  ├─ supabase.d.ts
│  ├─ types.ts
│  └─ vsl.ts
└─ utils
   └─ supabase
      ├─ auth.ts
      ├─ client.ts
      └─ server.ts

```