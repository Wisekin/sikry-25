"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Plus, Search, Filter, Download, Upload, Building2, Globe, MapPin, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from 'react-i18next';
import { getCompanies } from "@/src/actions/companies"
import type { DiscoveredCompany } from "@/src/types/database"

export default function CompaniesPage() {
  const router = useRouter()
  const { t } = useTranslation('companiesPage')
  const { t: tc } = useTranslation('common')
  const [companies, setCompanies] = useState<DiscoveredCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("all")

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const data = await getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error("Error loading companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = industryFilter === "all" || company.industry === industryFilter
    return matchesSearch && matchesIndustry
  })

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return <Badge className="bg-green-100 text-green-800">{confidence}%</Badge>
    if (confidence >= 60) return <Badge className="bg-yellow-100 text-yellow-800">{confidence}%</Badge>
    return <Badge className="bg-red-100 text-red-800">{confidence}%</Badge>
  }

  const getStatusBadge = (verified: boolean) => {
    return verified ? (
      <Badge className="bg-green-100 text-green-800">{t("companies.verified")}</Badge>
    ) : (
      <Badge variant="outline">{t("status.pending")}</Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            Showing {filteredCompanies.length} {filteredCompanies.length === 1 ? 'result' : 'results'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/companies/import")}>
            <Upload className="h-4 w-4 mr-2" />
            {t("importButton")}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("exportButton")}
          </Button>
          <Button onClick={() => router.push("/companies/new")}>
            <Plus className="h-4 w-4 mr-2" />
            {t("addNewButton")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("filters.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("filters.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue>
                  {industryFilter === "all" 
                    ? t("filters.industries.all") 
                    : t(`filters.industries.${industryFilter.toLowerCase()}`)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.industries.all")}</SelectItem>
                <SelectItem value="Technology">{t("filters.industries.technology")}</SelectItem>
                <SelectItem value="Marketing">{t("filters.industries.marketing")}</SelectItem>
                <SelectItem value="Finance">{t("filters.industries.finance")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {t("filters.title")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          <CardDescription>
            Showing {filteredCompanies.length} of {companies.length} companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("tableHeaders.name")}</TableHead>
                <TableHead>{t("tableHeaders.domain")}</TableHead>
                <TableHead>{t("tableHeaders.industry")}</TableHead>
                <TableHead>{t("tableHeaders.location")}</TableHead>
                <TableHead>{t("tableHeaders.size")}</TableHead>
                <TableHead>{t("tableHeaders.confidence")}</TableHead>
                <TableHead>{t("tableHeaders.status")}</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {company.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.domain && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`https://${company.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {company.domain}
                        </a>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{company.industry && <Badge variant="outline">{company.industry}</Badge>}</TableCell>
                  <TableCell>
                    {company.location_text && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {company.location_text}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.company_size && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {t('companySizeValue', { count: Number(company.company_size) })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getConfidenceBadge(company.confidence_score || 0)}</TableCell>
                  <TableCell>{getStatusBadge(company.is_verified || false)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/companies/${company.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">{t("noResults.title")}</h3>
              <p className="text-muted-foreground">{t("noResults.description")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
