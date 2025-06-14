import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  MagnifyingGlassIcon,
  BoltIcon,
  ShieldCheckIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid"
import Link from "next/link"
import { SmartSearchBar } from "@/src/components/search/SmartSearchBar"

export default function HomePage() {
  const features = [
    {
      icon: MagnifyingGlassIcon,
      title: "Natural Language Search",
      description: "Find companies using conversational queries powered by AI",
      example: "Find SaaS companies in Switzerland with 50+ employees",
    },
    {
      icon: UsersIcon,
      title: "Zero-Config Data Extraction",
      description: "Automatically extract contact information and company data",
      example: "Emails, phones, technologies detected with 95% accuracy",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Unified Communications",
      description: "Engage prospects through email, SMS, and WhatsApp",
      example: "Multi-channel campaigns with spam protection",
    },
    {
      icon: ArrowTrendingUpIcon,
      title: "Market Intelligence",
      description: "Analyze competitors and market trends in real-time",
      example: "Relationship mapping and competitive analysis",
    },
  ]

  const trustIndicators = ["SOC 2 Type II Certified", "GDPR Compliant", "99.9% Uptime SLA", "Enterprise Security"]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">S-I-K-R-Y</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/search" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Search
            </Link>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
            <BoltIcon className="w-3 h-3 mr-1" />
            World's First AI-Powered Business Intelligence Platform
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Discover, Analyze, and <span className="text-blue-600">Engage Businesses</span> with AI
          </h1>

          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-600">
            Transform how you find and connect with businesses using natural language search, automated data extraction,
            and unified communication channels.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SmartSearchBar
              placeholder="Find companies: 'Marketing agencies in Geneva with 10-50 employees'"
              showSuggestions={true}
            />
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {trustIndicators.map((indicator, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1 border-gray-300 text-gray-600">
                <ShieldCheckIcon className="w-3 h-3" />
                {indicator}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Powered by AI for Every Use Case</h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-600">
            From sales prospecting to market research, S-I-K-R-Y adapts to your business intelligence needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white border-gray-200"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg p-3 bg-gray-50">
                  <p className="text-sm italic text-gray-600">"{feature.example}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Business Intelligence?</h2>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of companies already using S-I-K-R-Y to discover, analyze, and engage with businesses
            worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="bg-white text-blue-800 hover:bg-gray-100">
              <Link href="/search">
                Start Free Search
                {/* <ArrowRightIcon className="w-4 h-4 ml-2" /> */}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-800">
              Book Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-semibold">S-I-K-R-Y</span>
              </div>
              <p className="text-gray-400">
                Sikso Intelligent Knowledge Retrieval Ystem - Your business intelligence ecosystem.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/search" className="hover:text-white transition-colors">
                    Search
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="hover:text-white transition-colors">
                    Companies
                  </Link>
                </li>
                <li>
                  <Link href="/comms" className="hover:text-white transition-colors">
                    Communications
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 S-I-K-R-Y. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
