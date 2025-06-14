import { Button } from "@/src//components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src//components/ui/card"
import { Badge } from "@/src//components/ui/badge"
import { Check, Search, Zap, Crown } from "lucide-react"
import Link from "next/link"
import { useTranslation } from 'react-i18next';
import { Heading } from "@/src//components/core/typography/Heading"
import { Text } from "@/src//components/core/typography/Text"

export default function PricingPage() {
  const { t } = useTranslation('pricingPage');

  const planDefinitions = [
    {
      id: "starter",
      icon: Search,
      popular: false,
      nameKey: "plans.starter.name",
      priceKey: "plans.starter.price",
      periodKey: "plans.starter.period",
      descriptionKey: "plans.starter.description",
      featuresKeys: [
        "plans.starter.features.0",
        "plans.starter.features.1",
        "plans.starter.features.2",
        "plans.starter.features.3",
        "plans.starter.features.4",
        "plans.starter.features.5"
      ],
      limitationsKeys: [
        "plans.starter.limitations.0",
        "plans.starter.limitations.1",
        "plans.starter.limitations.2"
      ],
      ctaKey: "plans.starter.ctaButton"
    },
    {
      id: "professional",
      icon: Zap,
      popular: true,
      nameKey: "plans.professional.name",
      priceKey: "plans.professional.price",
      periodKey: "plans.professional.period",
      descriptionKey: "plans.professional.description",
      featuresKeys: [
        "plans.professional.features.0",
        "plans.professional.features.1",
        "plans.professional.features.2",
        "plans.professional.features.3",
        "plans.professional.features.4",
        "plans.professional.features.5",
        "plans.professional.features.6",
        "plans.professional.features.7"
      ],
      limitationsKeys: [
        "plans.professional.limitations.0",
        "plans.professional.limitations.1"
      ],
      ctaKey: "plans.professional.ctaButton",
      popularBadgeKey: "plans.professional.popularBadge"
    },
    {
      id: "enterprise",
      icon: Crown,
      popular: false,
      nameKey: "plans.enterprise.name",
      priceKey: "plans.enterprise.price", // This will be "Custom"
      periodKey: "plans.enterprise.period",
      descriptionKey: "plans.enterprise.description",
      featuresKeys: [
        "plans.enterprise.features.0",
        "plans.enterprise.features.1",
        "plans.enterprise.features.2",
        "plans.enterprise.features.3",
        "plans.enterprise.features.4",
        "plans.enterprise.features.5",
        "plans.enterprise.features.6",
        "plans.enterprise.features.7",
        "plans.enterprise.features.8",
        "plans.enterprise.features.9",
        "plans.enterprise.features.10",
        "plans.enterprise.features.11",
        "plans.enterprise.features.12"
      ],
      limitationsKeys: [],
      ctaKey: "plans.enterprise.ctaButton"
    },
  ];

  const plans = planDefinitions.map(p => ({
    id: p.id,
    icon: p.icon,
    popular: p.popular,
    name: t(p.nameKey),
    // Handle "Custom" price which is not a key, otherwise translate
    price: p.priceKey === "plans.enterprise.price" ? t(p.priceKey) : p.priceKey.includes('$') ? p.priceKey : t(p.priceKey), // Logic to check if priceKey is a key or direct value
    period: p.periodKey ? t(p.periodKey) : "", // Translate period only if key exists
    description: t(p.descriptionKey),
    features: p.featuresKeys.map(fk => t(fk)),
    limitations: p.limitationsKeys.map(lk => t(lk)),
    cta: t(p.ctaKey),
    popularBadge: p.popularBadgeKey ? t(p.popularBadgeKey) : undefined
  }));

  const faqDefinitions = [
    { questionKey: "faq.questions.0.question", answerKey: "faq.questions.0.answer" },
    { questionKey: "faq.questions.1.question", answerKey: "faq.questions.1.answer" },
    { questionKey: "faq.questions.2.question", answerKey: "faq.questions.2.answer" },
    { questionKey: "faq.questions.3.question", answerKey: "faq.questions.3.answer" },
    { questionKey: "faq.questions.4.question", answerKey: "faq.questions.4.answer" },
    { questionKey: "faq.questions.5.question", answerKey: "faq.questions.5.answer" },
  ];

  const faqs = faqDefinitions.map(f => ({
    question: t(f.questionKey),
    answer: t(f.answerKey)
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
            <Link href="/features" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              {t('nav.features')}
            </Link>
            <span className="text-sm font-medium text-primary">{t('nav.pricing')}</span>
            <Button size="sm" className="bg-accent hover:bg-accent/90">
              {t('nav.getStartedButton')}
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Heading level={1} className="mb-6">
            {t('hero.title.main')}<span className="text-accent">{t('hero.title.highlight')}</span>
          </Heading>
          <Text size="lg" className="text-secondary mb-8">
            {t('hero.description')}
          </Text>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <Check className="w-3 h-3 mr-1" />
            {t('hero.badgeText')}
          </Badge>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => ( // removed index, using plan.id
            <Card
              key={plan.id} // Use plan.id for key
              className={`shadow-card hover:shadow-floating transition-all relative ${
                plan.popular ? "ring-2 ring-accent scale-105" : ""
              }`}
            >
              {plan.popular && plan.popularBadge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-accent text-white">{plan.popularBadge}</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  {plan.period && <span className="text-secondary ml-2">{plan.period}</span>}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <Text size="sm">{feature}</Text>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-center gap-2 opacity-60">
                      <div className="w-4 h-4 flex-shrink-0" /> {/* Empty div for spacing like original */}
                      <Text size="sm" className="line-through">
                        {limitation}
                      </Text>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${plan.popular ? "bg-accent hover:bg-accent/90" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <Heading level={2} className="text-center mb-8">
            {t('faq.title')}
          </Heading>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text className="text-secondary">{faq.answer}</Text>
                </CardContent>
              </Card>
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
