"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SmartSearchBar } from "@/components/smart-search-bar"
import { CompanyCard } from "@/components/company-card"
import { MapPin, Filter, Download, Grid, Map, List, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

interface Company {
  id: string
  name: string
  domain: string
  location_text: string
  industry: string
  employees: string
  description: string
  logo?: string
  confidenceScore: number
  extractedData: {
    emails: string[]
    phones: string[]
    technologies: string[]
  }
  lastScraped: string
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const sources = searchParams.get("sources")?.split(",") || []
  const { t } = useTranslation('common')

  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [filters, setFilters] = useState({
    industry: "All Industries",
    location_text: "",
    employeeCount: "All Sizes",
    confidenceScore: 0,
  })

  const clearFilters = () => {
    setFilters({
      industry: "All Industries",
      location_text: "",
      employeeCount: "All Sizes",
      confidenceScore: 0,
    })
  }

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSortChange = (value: string) => {
    // TODO: Implement sorting logic
    console.log('Sorting by:', value)
  }

  // Mock data for demonstration
  const mockCompanies: Company[] = [
    {
      id: "1",
      name: "TechFlow Solutions",
      domain: "techflow.ch",
      location_text: "Geneva, Switzerland",
      industry: "Software Development",
      employees: "25-50",
      description: "Leading digital transformation consultancy specializing in React and TypeScript solutions.",
      confidenceScore: 95,
      extractedData: {
        emails: ["contact@techflow.ch", "hello@techflow.ch"],
        phones: ["+41 22 123 4567"],
        technologies: ["React", "TypeScript", "AWS", "Node.js"],
      },
      lastScraped: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Alpine Marketing Group",
      domain: "alpinemarketing.com",
      location_text: "Zurich, Switzerland",
      industry: "Marketing & Advertising",
      employees: "10-25",
      description: "Full-service marketing agency helping B2B companies scale their digital presence.",
      confidenceScore: 88,
      extractedData: {
        emails: ["info@alpinemarketing.com"],
        phones: ["+41 44 987 6543"],
        technologies: ["HubSpot", "Google Analytics", "WordPress"],
      },
      lastScraped: "2024-01-15T09:15:00Z",
    },
    {
      id: "3",
      name: "SwissFintech Innovations",
      domain: "swissfintech.io",
      location_text: "Basel, Switzerland",
      industry: "Financial Technology",
      employees: "50-100",
      description: "Pioneering blockchain and AI solutions for the financial services industry.",
      confidenceScore: 92,
      extractedData: {
        emails: ["contact@swissfintech.io", "partnerships@swissfintech.io"],
        phones: ["+41 61 555 0123"],
        technologies: ["Blockchain", "AI/ML", "Python", "Kubernetes"],
      },
      lastScraped: "2024-01-15T11:45:00Z",
    },
  ]

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setCompanies(mockCompanies)
      setLoading(false)
    }, 1500)
  }, [query, sources])

  const filteredCompanies = companies.filter((company) => {
    if (filters.industry !== "All Industries" && company.industry !== filters.industry) return false
    if (filters.location_text && !company.location_text.toLowerCase().includes(filters.location_text.toLowerCase())) return false
    if (filters.employeeCount !== "All Sizes" && company.employees !== filters.employeeCount) return false
    if (filters.confidenceScore && company.confidenceScore < filters.confidenceScore) return false
    return true
  })

  const handleExport = () => {
    const csvContent = [
      ["Name", "Domain", "Location Text", "Industry", "Employees", "Confidence Score"],
      ...filteredCompanies.map((company) => [
        company.name,
        company.domain,
        company.location_text,
        company.industry,
        company.employees,
        company.confidenceScore.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `search-results-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('search.mainTitle')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">{t('search.filters.title')}</h2>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t('search.filters.clear')}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('search.filters.locationPlaceholder')}
                  value={filters.location_text}
                  onChange={(e) => handleFilterChange('location_text', e.target.value)}
                  className="w-full pl-9"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('search.filters.industryLabel')}</label>
                <Select
                  value={filters.industry}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger>
                    <SelectValue>{filters.industry}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Industries">{t('search.filters.allIndustries')}</SelectItem>
                    <SelectItem value="Software Development">{t('search.filters.softwareDev')}</SelectItem>
                    <SelectItem value="Marketing & Advertising">{t('search.filters.marketing')}</SelectItem>
                    <SelectItem value="Financial Technology">{t('search.filters.fintech')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t('search.filters.sizeLabel')}</label>
                <Select
                  value={filters.employeeCount}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, employeeCount: value }))}
                >
                  <SelectTrigger>
                    <SelectValue>{filters.employeeCount}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Sizes">{t('search.filters.allSizes')}</SelectItem>
                    <SelectItem value="1-10">{t('search.filters.size1to10')}</SelectItem>
                    <SelectItem value="10-25">{t('search.filters.size10to25')}</SelectItem>
                    <SelectItem value="25-50">{t('search.filters.size25to50')}</SelectItem>
                    <SelectItem value="50-100">{t('search.filters.size50to100')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t('search.filters.minConfidenceLabel')}</label>
                <Select
                  value={String(filters.confidenceScore)}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, confidenceScore: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue>{filters.confidenceScore === 0 ? t('search.filters.anyScore') : `${filters.confidenceScore}%`}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t('search.filters.anyScore')}</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                title={t('search.views.grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                title={t('search.views.list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                title={t('search.views.map')}
              >
                <Map className="w-4 h-4" />
              </Button>
            </div>

            <Select
              defaultValue="relevance"
              onValueChange={(value) => handleSortChange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('search.sort.relevance')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">{t('search.sort.relevance')}</SelectItem>
                <SelectItem value="nameAsc">{t('search.sort.nameAsc')}</SelectItem>
                <SelectItem value="nameDesc">{t('search.sort.nameDesc')}</SelectItem>
                <SelectItem value="dateAsc">{t('search.sort.dateAsc')}</SelectItem>
                <SelectItem value="dateDesc">{t('search.sort.dateDesc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">{t('search.noResults.title')}</h3>
              <p className="text-muted-foreground">{t('search.noResults.description')}</p>
            </div>
          ) : (
            <Tabs value={viewMode} className="w-full">
              <TabsContent value="grid">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCompanies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list">
                <div className="space-y-4">
                  {filteredCompanies.map((company) => (
                    <CompanyCard key={company.id} company={company} layout="list" />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="map">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center">
                  <Map className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Map View Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Interactive map visualization will be available in the next update.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-700" />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  )
}
