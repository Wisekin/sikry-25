"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { LoadingSkeleton } from "@/src/components/core/loading/LoadingSkeleton";
import { useTranslation } from "react-i18next";
import { createMockApiResponse } from "@/src/utils/mockApiUtils";
import {
  ChartPieIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ListBulletIcon,
  PresentationChartLineIcon,
  ShieldCheckIcon,
  TableCellsIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Data Interfaces
interface GapSummaryStats {
  totalGapsIdentified: number;
  averageSeverity: 'High' | 'Medium' | 'Low';
  keyAreasForImprovement: string[];
  overallReadinessScore: number;
}

interface DetailedGapResult {
  id: string;
  area: string;
  gapDescription: string;
  severity: 'High' | 'Medium' | 'Low';
  recommendations: string[];
  responsibleTeam?: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

interface GapAnalysisResultsData {
  summaryStats: GapSummaryStats;
  detailedResults: DetailedGapResult[];
  severityDistributionChartData: ChartDataPoint[];
  areaDistributionChartData: ChartDataPoint[];
}

const severityColors = {
  High: '#ef4444',
  Medium: '#f97316',
  Low: '#eab308'
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function GapAnalysisResultsPage() {
  const { t } = useTranslation();
  const [results, setResults] = useState<GapAnalysisResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock data for development
      const mockData: GapAnalysisResultsData = {
        summaryStats: {
          totalGapsIdentified: 5,
          averageSeverity: 'Medium',
          keyAreasForImprovement: ['Technology Infrastructure', 'Process Automation', 'Team Training'],
          overallReadinessScore: 65
        },
        detailedResults: [
          {
            id: 'gap-1',
            area: 'Technology Infrastructure',
            gapDescription: 'Current technology stack needs modernization',
            severity: 'High',
            recommendations: ['Implement cloud infrastructure', 'Upgrade core systems'],
            responsibleTeam: 'IT Department'
          },
          {
            id: 'gap-2',
            area: 'Process Automation',
            gapDescription: 'Manual processes need automation',
            severity: 'Medium',
            recommendations: ['Identify automation opportunities', 'Implement workflow automation'],
            responsibleTeam: 'Operations Team'
          },
          {
            id: 'gap-3',
            area: 'Team Training',
            gapDescription: 'Skill gaps identified in key areas',
            severity: 'Low',
            recommendations: ['Develop training programs', 'Enhance team capabilities'],
            responsibleTeam: 'HR Department'
          }
        ],
        severityDistributionChartData: [
          { name: 'High', value: 1 },
          { name: 'Medium', value: 2 },
          { name: 'Low', value: 2 }
        ],
        areaDistributionChartData: [
          { name: 'Technology', value: 2 },
          { name: 'Process', value: 2 },
          { name: 'People', value: 1 }
        ]
      };

      const result = await createMockApiResponse(mockData);
      setResults(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('gapAnalysis.resultsPage.error.unknown'));
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // In-page loading state (supplements loading.tsx for initial load or refetch)
  if (isLoading && !results) {
    return (
      <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <LoadingSkeleton width="300px" height="36px" className="mb-2" />
            <LoadingSkeleton width="350px" height="20px" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <LoadingSkeleton height="120px" />
          <LoadingSkeleton height="120px" />
          <LoadingSkeleton height="120px" />
        </div>
        <LoadingSkeleton height="300px" className="mb-8" />
        <LoadingSkeleton height="200px" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-6">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-600 mb-2">{t('gapAnalysis.resultsPage.error.title')}</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button onClick={fetchData} className="flex items-center gap-2">
          <ArrowPathIcon className="w-5 h-5" />
          {t('gapAnalysis.resultsPage.tryAgain')}
        </Button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-6">
        <ListBulletIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">{t('gapAnalysis.resultsPage.noResults.title')}</h2>
        <p className="text-gray-500">{t('gapAnalysis.resultsPage.noResults.description')}</p>
      </div>
    );
  }

  const { summaryStats, detailedResults, severityDistributionChartData } = results;

  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 text-[#1B1F3B] p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">{t('gapAnalysis.results')}</h1>
          <p className="text-gray-500 mt-1">
            {t('gapAnalysis.resultsPage.subtitle')}
          </p>
        </div>
        <Button size="lg" className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2">
          <PresentationChartLineIcon className="w-5 h-5" />
          <span>{t('gapAnalysis.resultsPage.exportButton')}</span>
        </Button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('gapAnalysis.resultsPage.summary.totalGaps')}</CardTitle>
            <ListBulletIcon className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{summaryStats.totalGapsIdentified}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('gapAnalysis.resultsPage.summary.avgSeverity')}</CardTitle>
            <ExclamationTriangleIcon className={`w-5 h-5 ${severityColors[summaryStats.averageSeverity]?.replace('#','text-').slice(0,-4) || 'text-gray-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${severityColors[summaryStats.averageSeverity]?.replace('#','text-').slice(0,-4).replace('text-red','text-red-600').replace('text-orange','text-orange-600').replace('text-yellow','text-yellow-600') || 'text-gray-600'}`}>
              {t(`gapAnalysis.resultsPage.severity.${summaryStats.averageSeverity.toLowerCase()}` as any)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('gapAnalysis.resultsPage.summary.readinessScore')}</CardTitle>
            <ShieldCheckIcon className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{summaryStats.overallReadinessScore}%</div>
          </CardContent>
        </Card>
         <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-shadow lg:col-span-1 md:col-span-2 col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <LightBulbIcon className="w-5 h-5 text-purple-500 mr-2" />
              {t('gapAnalysis.resultsPage.summary.keyAreas')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryStats.keyAreasForImprovement.length > 0 ? (
              <ul className="space-y-1 text-sm text-purple-700 list-disc list-inside">
                {summaryStats.keyAreasForImprovement.slice(0, 3).map(area => <li key={area}>{area}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">{t('common.none')}</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ChartPieIcon className="w-6 h-6 mr-2 text-indigo-600" /> {t('gapAnalysis.resultsPage.charts.severityDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {severityDistributionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={severityDistributionChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {severityDistributionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={severityColors[entry.name] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, t(`gapAnalysis.resultsPage.severity.${name.toLowerCase()}` as any)]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-500 py-8">{t('gapAnalysis.resultsPage.charts.noData')}</p>}
          </CardContent>
        </Card>
        {/* Placeholder for another chart, e.g., Area Distribution */}
        <Card className="bg-white border-none shadow-sm">
           <CardHeader>
            <CardTitle className="flex items-center text-lg">
                <PresentationChartLineIcon className="w-6 h-6 mr-2 text-teal-600" /> {t('gapAnalysis.resultsPage.charts.areaDistribution')}
            </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[250px]">
                 <p className="text-gray-400">{t('gapAnalysis.resultsPage.charts.areaPlaceholder')}</p>
            </CardContent>
        </Card>
      </div>


      {/* Detailed Gap Analysis Results Table */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TableCellsIcon className="w-6 h-6 mr-2 text-blue-600" /> {t('gapAnalysis.resultsPage.detailedResults.title')}
          </CardTitle>
          <CardDescription>{t('gapAnalysis.resultsPage.detailedResults.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {detailedResults.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20%]">{t('gapAnalysis.resultsPage.detailedResults.area')}</TableHead>
                    <TableHead className="w-[30%]">{t('gapAnalysis.resultsPage.detailedResults.gapDescription')}</TableHead>
                    <TableHead className="w-[10%]">{t('gapAnalysis.resultsPage.detailedResults.severity')}</TableHead>
                    <TableHead className="w-[30%]">{t('gapAnalysis.resultsPage.detailedResults.recommendations')}</TableHead>
                    <TableHead className="w-[10%]">{t('gapAnalysis.resultsPage.detailedResults.responsibleTeam')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailedResults.map((gap) => (
                    <TableRow key={gap.id}>
                      <TableCell className="font-medium">{gap.area}</TableCell>
                      <TableCell>{gap.gapDescription}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${severityColors[gap.severity]?.replace('#','bg-').slice(0,-4).replace('bg-red','bg-red-100 text-red-800').replace('bg-orange','bg-orange-100 text-orange-800').replace('bg-yellow','bg-yellow-100 text-yellow-800') || 'bg-gray-100 text-gray-800'}`}>
                          {t(`gapAnalysis.resultsPage.severity.${gap.severity.toLowerCase()}` as any)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside text-xs">
                          {gap.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                        </ul>
                      </TableCell>
                      <TableCell className="text-sm">{gap.responsibleTeam || t('common.notAssigned')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <p className="text-center text-gray-500 py-8">{t('gapAnalysis.resultsPage.detailedResults.noDetailedResults')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
