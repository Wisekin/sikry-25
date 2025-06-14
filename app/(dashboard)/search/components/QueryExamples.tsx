"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Lightbulb, Search } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

interface QueryExamplesProps {
  onSelectQuery: (query: string) => void
}

export function QueryExamples({ onSelectQuery }: QueryExamplesProps) {
  const examples = [
    {
      category: "Industry Specific",
      queries: [
        "Marketing agencies in Geneva with 10-50 employees",
        "SaaS companies with Series A funding in Europe",
        "Fintech startups in Switzerland founded after 2020",
        "E-commerce platforms using Shopify with 100+ employees",
      ],
    },
    {
      category: "Technology Stack",
      queries: [
        "Companies using React and TypeScript in their tech stack",
        "Startups built on AWS with Node.js backend",
        "Businesses using Salesforce CRM and HubSpot",
        "Companies with Python and machine learning capabilities",
      ],
    },
    {
      category: "Business Criteria",
      queries: [
        "B2B companies with remote-first culture",
        "Consulting firms with international clients",
        "Companies hiring software engineers in Zurich",
        "Businesses with sustainability focus and ESG reporting",
      ],
    },
  ]

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Query Examples
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {examples.map((category, index) => (
          <div key={index}>
            <Badge variant="outline" className="mb-3">
              {category.category}
            </Badge>
            <div className="space-y-2">
              {category.queries.map((query, queryIndex) => (
                <Button
                  key={queryIndex}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => onSelectQuery(query)}
                >
                  <Search className="w-4 h-4 mr-2 flex-shrink-0" />
                  <Text size="sm">{query}</Text>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
