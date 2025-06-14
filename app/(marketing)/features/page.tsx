import { Button } from "@/src//components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/src//components/ui/card"
import { Badge } from "@/src//components/ui/badge"
import { Search, Users, MessageSquare, TrendingUp, Zap, Shield, Globe, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useTranslation } from 'react-i18next';
import { Heading } from "@/src//components/core/typography/Heading"
import { Text } from "@/src//components/core/typography/Text"

export default function FeaturesPage() {
  const { t } = useTranslation('featuresPage');



  // Corrected featureDefinitions based on JSON structure
  const featureDefinitions = [
    {
      categoryKey: "featureCategories.searchAndDiscovery.categoryTitle",
      icon: Search,
      items: [
        { titleKey: "featureCategories.searchAndDiscovery.items.naturalLanguageSearch.title", descriptionKey: "featureCategories.searchAndDiscovery.items.naturalLanguageSearch.description", badgeKey: "featureCategories.searchAndDiscovery.items.naturalLanguageSearch.badge" },
        { titleKey: "featureCategories.searchAndDiscovery.items.advancedFiltering.title", descriptionKey: "featureCategories.searchAndDiscovery.items.advancedFiltering.description", badgeKey: "featureCategories.searchAndDiscovery.items.advancedFiltering.badge" },
        { titleKey: "featureCategories.searchAndDiscovery.items.realTimeData.title", descriptionKey: "featureCategories.searchAndDiscovery.items.realTimeData.description", badgeKey: "featureCategories.searchAndDiscovery.items.realTimeData.badge" },
      ],
    },
    {
      categoryKey: "featureCategories.dataIntelligence.categoryTitle",
      icon: BarChart3,
      items: [
        { titleKey: "featureCategories.dataIntelligence.items.companyProfiles.title", descriptionKey: "featureCategories.dataIntelligence.items.companyProfiles.description", badgeKey: "featureCategories.dataIntelligence.items.companyProfiles.badge" },
        { titleKey: "featureCategories.dataIntelligence.items.marketTrends.title", descriptionKey: "featureCategories.dataIntelligence.items.marketTrends.description", badgeKey: "featureCategories.dataIntelligence.items.marketTrends.badge" },
        { titleKey: "featureCategories.dataIntelligence.items.contactEnrichment.title", descriptionKey: "featureCategories.dataIntelligence.items.contactEnrichment.description", badgeKey: "featureCategories.dataIntelligence.items.contactEnrichment.badge" },
      ],
    },
    {
      categoryKey: "featureCategories.communicationHub.categoryTitle",
      icon: MessageSquare,
      items: [
        { titleKey: "featureCategories.communicationHub.items.multiChannelOutreach.title", descriptionKey: "featureCategories.communicationHub.items.multiChannelOutreach.description", badgeKey: "featureCategories.communicationHub.items.multiChannelOutreach.badge" },
        { titleKey: "featureCategories.communicationHub.items.smartTemplates.title", descriptionKey: "featureCategories.communicationHub.items.smartTemplates.description", badgeKey: "featureCategories.communicationHub.items.smartTemplates.badge" },
        { titleKey: "featureCategories.communicationHub.items.campaignAnalytics.title", descriptionKey: "featureCategories.communicationHub.items.campaignAnalytics.description", badgeKey: "featureCategories.communicationHub.items.campaignAnalytics.badge" },
      ],
    },
    {
      categoryKey: "featureCategories.marketIntelligenceSuite.categoryTitle",
      icon: TrendingUp,
      items: [
        { titleKey: "featureCategories.marketIntelligenceSuite.items.competitorAnalysis.title", descriptionKey: "featureCategories.marketIntelligenceSuite.items.competitorAnalysis.description", badgeKey: "featureCategories.marketIntelligenceSuite.items.competitorAnalysis.badge" },
        { titleKey: "featureCategories.marketIntelligenceSuite.items.opportunitySignals.title", descriptionKey: "featureCategories.marketIntelligenceSuite.items.opportunitySignals.description", badgeKey: "featureCategories.marketIntelligenceSuite.items.opportunitySignals.badge" },
        { titleKey: "featureCategories.marketIntelligenceSuite.items.customReporting.title", descriptionKey: "featureCategories.marketIntelligenceSuite.items.customReporting.description", badgeKey: "featureCategories.marketIntelligenceSuite.items.customReporting.badge" },
      ],
    },
  ];

  const features = featureDefinitions.map(categoryDef => ({
    category: t(categoryDef.categoryKey),
    icon: categoryDef.icon,
    items: categoryDef.items.map(item => ({
      // Assuming items in featureDefinitions now correctly hold keys
      title: t(item.titleKey),
      description: t(item.descriptionKey),
      badge: t(item.badgeKey)
    }))
  }));

  const securityFeatures = [
    { titleKey: "securitySection.items.soc2.title", descriptionKey: "securitySection.items.soc2.description", icon: Shield },
    { titleKey: "securitySection.items.gdpr.title", descriptionKey: "securitySection.items.gdpr.description", icon: Globe },
    { titleKey: "securitySection.items.roleBasedAccess.title", descriptionKey: "securitySection.items.roleBasedAccess.description", icon: Users },
    { titleKey: "securitySection.items.uptime.title", descriptionKey: "securitySection.items.uptime.description", icon: Zap },
  ].map(secFeature => ({
    ...secFeature,
    title: t(secFeature.titleKey),
    description: t(secFeature.descriptionKey)
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-surface/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-primary">SIKRY</span> {/* Brand name, likely not translated */}
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            <span className="text-sm font-medium text-primary">{t('nav.features')}</span>
            <Link href="/pricing" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              {t('nav.pricing')}
            </Link>
            <Button size="sm" className="bg-accent hover:bg-accent/90">
              {t('nav.getStartedButton')}
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-6 bg-accent/10 text-accent border-accent/20">
            <Zap className="w-3 h-3 mr-1" />
            {t('hero.badge')}
          </Badge>
          <Heading level={1} className="mb-6">
            {t('hero.title.main')}<span className="text-accent">{t('hero.title.highlight')}</span>
          </Heading>
          <Text size="lg" className="text-secondary">
            {t('hero.description')}
          </Text>
        </div>

        {/* Features Grid */}
        <div className="space-y-16">
          {features.map((categoryItem, categoryIndex) => ( // category is now categoryItem due to mapping
            <div key={categoryIndex}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <categoryItem.icon className="w-5 h-5 text-white" />
                </div>
                <Heading level={2}>{categoryItem.category}</Heading>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {categoryItem.items.map((feature, featureIndex) => (
                  <Card key={featureIndex} className="shadow-card hover:shadow-floating transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {feature.badge}
                        </Badge>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Security & Compliance */}
        <div className="mt-16 p-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
            <Heading level={2} className="mb-4">
              {t('securitySection.title')}
            </Heading>
            <Text className="text-secondary max-w-2xl mx-auto">
              {t('securitySection.description')}
            </Text>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {securityFeatures.map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  index === 0 ? 'bg-emerald-100' : index === 1 ? 'bg-blue-100' : index === 2 ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <item.icon className={`w-8 h-8 ${
                    index === 0 ? 'text-emerald-600' : index === 1 ? 'text-blue-600' : index === 2 ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
                <Text className="font-medium">{item.title}</Text>
                <Text size="sm" className="text-secondary">
                  {item.description}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <Heading level={2} className="text-white mb-4">
            {t('cta.title')}
          </Heading>
          <Text size="lg" className="opacity-90 mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/search">{t('cta.trialButton')}</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
              {t('cta.demoButton')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
