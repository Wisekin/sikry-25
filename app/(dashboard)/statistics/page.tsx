"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Bar, Pie, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import {
  ChartBarIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleStackIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// --- NEW Quality Metric Card Component ---
const QualityMetricCard = ({ title, percentage, color, icon: Icon }: { title: string, percentage: number, color: string, icon: React.ElementType }) => {
  const strokeWidth = 10;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = percentage / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Card className="transform transition-all duration-300 hover:scale-105 hover:bg-gray-50/50">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="relative h-40 w-40">
          <svg className="h-full w-full" viewBox="0 0 160 160">
            <circle
              className="text-gray-200"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="80"
              cy="80"
            />
            <circle
              className={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="80"
              cy="80"
              transform="rotate(-90 80 80)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <Icon className={`w-8 h-8 ${color} mb-1`} />
            <span className="text-3xl font-bold text-[#1B1F3B]">{percentage}%</span>
          </div>
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-700">{title}</p>
      </CardContent>
    </Card>
  );
};


export default function StatisticsPage() {
  const { t } = useTranslation('statisticsPage')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId)
  }

  // --- CHART DATA & OPTIONS (Light Theme) ---

  const textColor = '#3C4568'; // Dark color for text
  const gridColor = 'rgba(60, 69, 104, 0.1)'; // Faint grid lines

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        ticks: { color: textColor, beginAtZero: true },
        grid: { color: gridColor }
      },
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor }
      }
    }
  };

  const collectionTrendsData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: t('charts.companiesAdded'),
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: 'rgba(60, 69, 104, 0.8)',
      borderColor: '#2A3050',
      borderWidth: 2,
      borderRadius: 4,
      hoverBackgroundColor: '#1B1F3B'
    }],
  };

  const sectorAnalysisData = {
    labels: ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Other'],
    datasets: [{
      label: t('charts.distribution'),
      data: [35, 25, 15, 12, 8, 5],
      // --- NEW: Upgraded Pie Chart Colors ---
      backgroundColor: [
        '#4F46E5', // Indigo
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#3B82F6', // Blue
        '#8B5CF6'  // Violet
      ],
      borderColor: '#FFFFFF',
      hoverOffset: 8,
      hoverBorderColor: '#F3F4F6'
    }],
  };
  
  const sectorAnalysisOptions = {
      ...chartOptions,
      plugins: {
          legend: {
              position: 'right' as const,
              labels: {
                  color: textColor,
                  font: { size: 12 },
                  boxWidth: 20,
                  padding: 20,
              }
          }
      }
  };

  const performanceMetricsData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q1 (Prev)', 'Q2 (Prev)'],
    datasets: [{
      label: t('charts.qualityScore'),
      data: [92, 95, 93, 94, 88, 90],
      fill: true,
      backgroundColor: 'rgba(60, 69, 104, 0.1)',
      borderColor: '#3C4568',
      pointBackgroundColor: '#1B1F3B',
      pointBorderColor: '#3C4568',
      tension: 0.4,
    }],
  };

  return (
    <div className="min-h-screen space-y-8 bg-white text-[#1B1F3B] p-6 md:p-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">{t('header.title')}</h1>
        <p className="text-gray-500 mt-1">
          {t('header.subtitle')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BuildingOfficeIcon className="w-4 h-4" /> {t('keyMetrics.totalCompanies')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1B1F3B]">12,458</div>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <ArrowTrendingUpIcon className="w-3 h-3" /> {t('keyMetrics.companiesThisMonth', { count: 124 })}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4" /> {t('keyMetrics.activeScrapers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1B1F3B]">87</div>
            <p className="text-sm text-gray-500">{t('keyMetrics.lastRun', { time: '2 hours ago' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4" /> {t('keyMetrics.campaigns')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1B1F3B]">34</div>
            <p className="text-sm text-green-600">{t('keyMetrics.deliveryRate', { rate: 92 })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <EyeIcon className="w-4 h-4" /> {t('keyMetrics.dataQuality')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">94%</div>
            <p className="text-sm text-green-600">{t('keyMetrics.qualityIncrease', { percent: 2 })}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Expandable Analytics Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg text-[#1B1F3B]">
                <ChartBarIcon className="w-5 h-5 text-blue-600" /> {t('charts.collectionTrends')}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => toggleCard("collection")} className="flex items-center gap-1 text-gray-600 hover:bg-gray-100">
                {expandedCard === "collection" ? t('actions.collapse') : t('actions.expand')}
                {expandedCard === "collection" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64"><Bar data={collectionTrendsData} options={chartOptions} /></div>
            {expandedCard === "collection" && (
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                  <h4 className="font-medium mb-2 text-gray-800">{t('tables.topSources')}</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">{t('tables.linkedinScraper')}</span><span className="font-medium text-[#1B1F3B]">34%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">{t('tables.companyWebsites')}</span><span className="font-medium text-[#1B1F3B]">28%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">{t('tables.publicDirectories')}</span><span className="font-medium text-[#1B1F3B]">22%</span></div>
                  </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg text-[#1B1F3B]">
                <CircleStackIcon className="w-5 h-5 text-purple-600" /> {t('charts.sectorAnalysis')}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => toggleCard("sector")} className="flex items-center gap-1 text-gray-600 hover:bg-gray-100">
                {expandedCard === "sector" ? t('actions.collapse') : t('actions.expand')}
                {expandedCard === "sector" ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex justify-center"><Pie data={sectorAnalysisData} options={sectorAnalysisOptions} /></div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="quality" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="performance" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">{t('tabs.performance')}</TabsTrigger>
          <TabsTrigger value="sources" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">{t('tabs.dataSources')}</TabsTrigger>
          <TabsTrigger value="quality" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">{t('tabs.quality')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white border-gray-200 hover:border-[#3C4568] transition-colors duration-300">
              <CardHeader><CardTitle className="text-base text-gray-800">{t('tabs.dataCollectionSummary')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t('tabs.totalRecords')}</span><span className="font-medium text-[#1B1F3B]">124,567</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t('tabs.thisMonth')}</span><span className="font-medium text-[#1B1F3B]">11,234</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t('tabs.successRate')}</span><span className="font-medium text-green-600">94.2%</span></div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200 hover:border-[#3C4568] transition-colors duration-300">
              <CardHeader><CardTitle className="text-base text-gray-800">{t('tabs.topIndustries')}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t('tabs.technology')}</span><span className="font-medium text-[#1B1F3B]">35%</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t('tabs.finance')}</span><span className="font-medium text-[#1B1F3B]">25%</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t('tabs.healthcare')}</span><span className="font-medium text-[#1B1F3B]">15%</span></div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200 hover:border-[#3C4568] transition-colors duration-300">
              <CardHeader><CardTitle className="text-base text-gray-800">{t('tabs.regionalDistribution')}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t('tabs.dach')}</span><span className="font-medium text-[#1B1F3B]">68%</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t('tabs.eu')}</span><span className="font-medium text-[#1B1F3B]">22%</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t('tabs.global')}</span><span className="font-medium text-[#1B1F3B]">10%</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-white border-gray-200">
            <CardHeader><CardTitle className="flex items-center gap-2 text-[#1B1F3B]"><CpuChipIcon className="w-5 h-5 text-orange-500"/> {t('charts.performanceMetrics')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72 mb-4"><Line data={performanceMetricsData} options={chartOptions} /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg"><div className="text-lg font-bold text-green-600">98.5%</div><div className="text-xs text-gray-500">{t('tabs.uptime')}</div></div>
                  <div className="p-3 bg-gray-50 rounded-lg"><div className="text-lg font-bold text-blue-600">156ms</div><div className="text-xs text-gray-500">{t('tabs.avgResponse')}</div></div>
                  <div className="p-3 bg-gray-50 rounded-lg"><div className="text-lg font-bold text-green-600">↓ 0.3%</div><div className="text-xs text-gray-500">{t('tabs.errorRate')}</div></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card className="bg-white border-gray-200">
            <CardHeader><CardTitle className="text-gray-800">{t('tables.dataSourcePerformance')}</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-200">
                    <tr className="text-sm font-medium text-gray-500">
                      <th className="p-3">{t('tables.source')}</th><th className="p-3">{t('tables.records')}</th><th className="p-3">{t('tables.quality')}</th><th className="p-3">{t('tables.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium text-gray-800">{t('tables.linkedinScraper')}</td><td>42,567</td><td className="text-green-600 font-medium">98%</td><td><span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full font-semibold">{t('tables.active')}</span></td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium text-gray-800">{t('tables.companyWebsites')}</td><td>34,891</td><td className="text-green-600 font-medium">95%</td><td><span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full font-semibold">{t('tables.active')}</span></td>
                    </tr>
                     <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium text-gray-800">{t('tables.publicDirectories')}</td><td>28,234</td><td className="text-yellow-600 font-medium">87%</td><td><span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full font-semibold">{t('tables.monitoring')}</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-gray-800">{t('tables.apiIntegrations')}</td><td>18,875</td><td className="text-red-600 font-medium">72%</td><td><span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full font-semibold">{t('tables.needsAttention')}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- NEW: Upgraded Quality Tab --- */}
        <TabsContent value="quality">
            <Card className="bg-white border-gray-200">
                <CardHeader>
                    <CardTitle className="text-gray-800">{t('qualityBreakdown.title')}</CardTitle>
                    <p className="text-gray-500 text-sm mt-1">
                        {t('qualityBreakdown.subtitle')}
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-8">
                        <QualityMetricCard 
                            title={t('qualityBreakdown.completeness')} 
                            percentage={96}
                            color="text-emerald-500"
                            icon={DocumentTextIcon}
                        />
                        <QualityMetricCard 
                            title={t('qualityBreakdown.accuracy')} 
                            percentage={94}
                            color="text-blue-500"
                            icon={CheckCircleIcon}
                        />
                        <QualityMetricCard 
                            title={t('qualityBreakdown.timeliness')} 
                            percentage={92}
                            color="text-purple-500"
                            icon={ClockIcon}
                        />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  )
}