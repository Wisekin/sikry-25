"use client"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Badge } from "@/src/components/ui/badge"
import { Plus, Download, Upload, Filter, Search, Calendar, Play, Settings, UserPlus, ShieldCheck, LayoutGrid, List, Share2, Globe, Linkedin, Database, MapPin, X, Grid } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useSearchStore } from '@/stores/searchStore';

export function SecondaryMenuBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  // Zustand search store (always called)
  const {
    query,
    setQuery,
    selectedSources,
    setSelectedSources,
    viewMode,
    setViewMode,
    fetchSearchResults,
    results
  } = useSearchStore();

  // Handlers for /search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setQuery(query.trim());
      fetchSearchResults({ forceRefresh: true });
    }
  };
  const handleClear = () => setQuery("");
  const toggleSource = (source: string) => {
    setSelectedSources(
      selectedSources.includes(source)
        ? selectedSources.filter((s: string) => s !== source)
        : [...selectedSources, source]
    );
  };
  const handleExport = () => {
    // Placeholder: implement export logic as needed
    // e.g., exportResults(results)
  };
  const hoverClass = "hover:bg-[var(--scrollbar-thumb)] hover:text-white";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', view);
    router.push(`${pathname}?${params.toString()}`);
  };

  const getContextualContent = () => {
    if (pathname.includes("/admin/team")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs 
            defaultValue={searchParams.get('tab') || "overview"} 
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Overview</TabsTrigger>
              <TabsTrigger value="members" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Members</TabsTrigger>
              <TabsTrigger value="roles" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Roles</TabsTrigger>
              <TabsTrigger value="permissions" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Permissions</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'grid' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'list' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    }

    if (pathname.includes("/analytics/conversion")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs
            defaultValue={searchParams.get('tab') || "funnel"}
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="funnel" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Funnel Analysis</TabsTrigger>
              <TabsTrigger value="trends" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Trends</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )
    }

    if (pathname.includes("/gap-analysis/letters")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs
            defaultValue={searchParams.get('tab') || "templates"}
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="templates" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Templates</TabsTrigger>
              <TabsTrigger value="generated" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Generated Letters</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )
    }

    if (pathname.includes("/gap-analysis/form")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs
            defaultValue={searchParams.get('tab') || "editor"}
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="editor" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Form Editor</TabsTrigger>
              <TabsTrigger value="submissions" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Submissions</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )
    }

    if (pathname.includes("/reviews/booster")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs
            defaultValue={searchParams.get('tab') || "boosters"}
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="boosters" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Boosters</TabsTrigger>
              <TabsTrigger value="settings" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )
    }

    if (pathname.includes("/reengagement/automation")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs
            defaultValue={searchParams.get('tab') || "workflows"}
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="workflows" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Workflows</TabsTrigger>
              <TabsTrigger value="activity" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Activity</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )
    }

    if (pathname.includes("/reengagement/classification")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs
            defaultValue={searchParams.get('tab') || "rules"}
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="rules" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Rules</TabsTrigger>
              <TabsTrigger value="history" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">History</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )
    }

    if (pathname.includes("/admin/security")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs 
            defaultValue={searchParams.get('tab') || "overview"} 
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Overview</TabsTrigger>
              <TabsTrigger value="logs" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Security Logs</TabsTrigger>
              <TabsTrigger value="policies" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Policies</TabsTrigger>
              <TabsTrigger value="access" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Access Control</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'grid' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'list' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    }

    if (pathname.includes("/companies")) {
      return (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => router.push("/companies/new")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("nav.secondary.addCompany")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/companies/import")}>
            <Upload className="h-4 w-4 mr-2" />
            {t("nav.secondary.importCompanies")}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t("nav.secondary.exportData")}
          </Button>
        </div>
      )
    }

    if (pathname.includes("/comms")) {
      return (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => router.push("/comms/new")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("nav.secondary.newMessage")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/comms/campaigns/new")}>
            <Calendar className="h-4 w-4 mr-2" />
            {t("nav.secondary.newCampaign")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/comms/templates")}>
            <Settings className="h-4 w-4 mr-2" />
            {t("nav.secondary.templates")}
          </Button>
        </div>
      )
    }

    if (pathname.includes("/scrapers")) {
      return (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => router.push("/scrapers/new")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("nav.secondary.newScraper")}
          </Button>
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            {t("nav.secondary.runScraper")}
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {t("nav.secondary.scheduleJob")}
          </Button>
        </div>
      )
    }

    // Add this block for /search page
    if (pathname === "/search" || pathname.startsWith("/search?")) {
      return (
        <div className="flex items-center w-full px-2 gap-2">
          {/* Search Bar, Source Selectors, View Mode Buttons */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <form className="flex-grow min-w-[320px] max-w-lg" onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by company name, keywords, industry, location..."
                  className="h-9 text-sm pr-8 min-w-[220px] md:min-w-[320px] lg:min-w-[400px]"
                />
                {query && (
                  <button type="button" onClick={handleClear} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
            <div className="flex items-center gap-1 ml-2">
              {["google", "linkedin", "crunchbase"].map(source => (
                <Button
                  key={source}
                  size="sm"
                  variant={selectedSources.includes(source) ? "default" : "outline"}
                  className={`px-2 py-1 text-xs ${hoverClass}`}
                  onClick={() => toggleSource(source)}
                >
                  {source === "google" && <Globe className="w-4 h-4 mr-1" />}
                  {source === "linkedin" && <Linkedin className="w-4 h-4 mr-1" />}
                  {source === "crunchbase" && <Database className="w-4 h-4 mr-1" />}
                  <span className="capitalize">{source}</span>
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button size="icon" variant={viewMode === 'grid' ? "default" : "outline"} className={`h-8 w-8 ${hoverClass}`} onClick={() => setViewMode('grid')}>
                <Grid className="w-4 h-4" />
              </Button>
              <Button size="icon" variant={viewMode === 'list' ? "default" : "outline"} className={`h-8 w-8 ${hoverClass}`} onClick={() => setViewMode('list')}>
                <List className="w-4 h-4" />
              </Button>
              <Button size="icon" variant={viewMode === 'map' ? "default" : "outline"} className={`h-8 w-8 ${hoverClass}`} onClick={() => setViewMode('map')}>
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* Export Button at the far right */}
          <div className="flex-shrink-0">
            <Button size="sm" className={`bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-1 ml-2 ${hoverClass}`} onClick={handleExport}>
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        </div>
      );
    }

    if (pathname.includes("/admin/billing")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs 
            defaultValue={searchParams.get('tab') || "overview"} 
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Overview</TabsTrigger>
              <TabsTrigger value="invoices" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Invoices</TabsTrigger>
              <TabsTrigger value="usage" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Usage</TabsTrigger>
              <TabsTrigger value="plans" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Plans</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'grid' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'list' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    }

    if (pathname.includes("/admin/users")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs 
            defaultValue={searchParams.get('tab') || "overview"} 
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Overview</TabsTrigger>
              <TabsTrigger value="users" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Users</TabsTrigger>
              <TabsTrigger value="invites" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Invites</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'grid' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'list' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    }

    if (pathname.includes("/admin/compliance")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs 
            defaultValue={searchParams.get('tab') || "overview"} 
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Overview</TabsTrigger>
              <TabsTrigger value="logs" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Compliance Logs</TabsTrigger>
              <TabsTrigger value="policies" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Policies</TabsTrigger>
              <TabsTrigger value="reports" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Reports</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'grid' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'list' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    }

    if (pathname.includes("/admin/monitoring")) {
      return (
        <div className="flex items-center gap-4">
          <Tabs 
            defaultValue={searchParams.get('tab') || "overview"} 
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-auto grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Overview</TabsTrigger>
              <TabsTrigger value="alerts" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Alerts</TabsTrigger>
              <TabsTrigger value="metrics" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">Metrics</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'grid' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${searchParams.get('view') === 'list' ? 'bg-[#3C4568] text-white' : ''}`}
              onClick={() => handleViewChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-xs">
          {t("dashboard.overview")}
        </Badge>
      </div>
    )
  }

  const getActions = () => {
    if (pathname === "/search" || pathname.startsWith("/search?")) {
      return null;
    }
    if (pathname.includes("/admin/team")) {
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input placeholder="Search members..." className="w-64 h-8" />
            <Button size="sm" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/admin/team/new")}
            className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      )
    }

    if (pathname.includes("/admin/security")) {
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input placeholder="Search security logs..." className="w-64 h-8" />
            <Button size="sm" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/admin/security/new-policy")}
            className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            New Policy
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      )
    }

    if (pathname.includes("/reengagement/classification")) {
      return (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => router.push("/reengagement/classification/new-rule")}
            className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        </div>
      )
    }

    if (pathname.includes("/reengagement/automation")) {
      return (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => router.push("/reengagement/automation/new-workflow")}
            className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      )
    }

    if (pathname.includes("/reviews/booster")) {
      return (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => router.push("/reviews/booster/new-campaign")}
            className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Booster Campaign
          </Button>
        </div>
      )
    }

    if (pathname.includes("/gap-analysis/form")) {
      return (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => router.push("/gap-analysis/form/share")}
            className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Form
          </Button>
        </div>
      )
    }

    if (pathname.includes("/gap-analysis/letters")) {
      return (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => router.push("/gap-analysis/letters/new-template")}
            className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      )
    }

    if (pathname.includes("/analytics/conversion")) {
      return (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => router.push("/analytics/conversion/customize")}
            className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Customize Dashboard
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {pathname.split("/").pop()?.replace("-", " ") || t("dashboard.title")}
        </Badge>
      </div>
    )
  }

  // Only render if we're not on a disabled path
  return (
    <div className="sticky top-16 z-40 w-full border-b border-gray-100/80 bg-white/98 backdrop-blur-md">
      <div className="flex h-12 items-center justify-between px-6">
        <div className="flex items-center gap-4">{getContextualContent()}</div>
        <div className="flex items-center gap-2">
          {getActions()}
        </div>
      </div>
    </div>
  )
}
