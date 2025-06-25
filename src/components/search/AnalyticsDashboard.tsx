import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { DataVisualizationWidget } from './DataVisualizationWidget'; // Assuming it's in the same directory
import { DollarSign, Users, SearchCodeIcon, Zap } from 'lucide-react'; // Example icons

// Mock data for charts - replace with actual data fetching and processing
const mockBarData = [
  { name: 'Jan', value: 65 },
  { name: 'Feb', value: 59 },
  { name: 'Mar', value: 80 },
  { name: 'Apr', value: 81 },
  { name: 'May', value: 56 },
  { name: 'Jun', value: 55 },
];

const mockLineData = [
  { name: 'Day 1', value: 30 },
  { name: 'Day 2', value: 40 },
  { name: 'Day 3', value: 35 },
  { name: 'Day 4', value: 50 },
  { name: 'Day 5', value: 49 },
  { name: 'Day 6', value: 60 },
];

const mockPieData = [
    { name: 'Source A', value: 400 },
    { name: 'Source B', value: 300 },
    { name: 'Source C', value: 300 },
    { name: 'Source D', value: 200 },
];

export const AnalyticsDashboard: React.FC = () => {
  // In a real scenario, you'd fetch this data or derive it from a store
  const placeholderStats = [
    { title: 'Total Discoveries', value: '1,234', icon: <SearchCodeIcon className="h-6 w-6 text-blue-500" />, description: '+20% from last month' },
    { title: 'Successful Extractions', value: '987', icon: <Zap className="h-6 w-6 text-green-500" />, description: '80% success rate' },
    { title: 'Companies Enriched', value: '750', icon: <Users className="h-6 w-6 text-purple-500" />, description: 'New companies added' },
    { title: 'Placeholder Stat', value: '$10.2k', icon: <DollarSign className="h-6 w-6 text-amber-500" />, description: 'Some financial metric' },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {placeholderStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <DataVisualizationWidget
          title="Discovery Trends (Mock)"
          description="Number of websites discovered over time."
          chartType="line"
          data={mockLineData}
        />
        <DataVisualizationWidget
          title="Extraction Success Rate (Mock)"
          description="Breakdown of successful vs. failed extractions."
          chartType="bar"
          data={mockBarData}
        />
        <DataVisualizationWidget
          title="Data Source Distribution (Mock)"
          description="Distribution of data sources for enrichment."
          chartType="pie"
          data={mockPieData}
          className="md:col-span-1 lg:col-span-2" // Example of spanning for different layouts
        />
         <DataVisualizationWidget
          title="Total Searches (Mock)"
          description="Total number of searches performed this month."
          chartType="number"
          data={2450}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
