import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { BarChart2, PieChart as PieIcon, LineChart as LineIcon, HelpCircle } from 'lucide-react'; // Renamed icons
import { cn } from '@/lib/utils';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components - ensuring all needed are registered
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


// Define generic types for chart data
type ChartType = 'bar' | 'pie' | 'line' | 'number';

export interface ChartDataItem { // Exporting for potential use elsewhere
  name: string; // Corresponds to labels
  value: number; // Corresponds to data points
  color?: string; // Optional color for pie/bar segments
  [key: string]: any;
}

interface DataVisualizationWidgetProps {
  title: string;
  description?: string;
  chartType: ChartType;
  data: ChartDataItem[] | number;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  // Config options could include `options` for Chart.js directly
  chartJsOptions?: any; // To pass full Chart.js options object
}

const defaultChartColors = [
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 99, 132, 0.6)',
  'rgba(75, 192, 192, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(153, 102, 255, 0.6)',
  'rgba(255, 159, 64, 0.6)',
  'rgba(99, 255, 132, 0.6)',
];

export function DataVisualizationWidget({
  title,
  description,
  chartType,
  data,
  isLoading = false,
  error = null,
  className,
  chartJsOptions = {}, // Default to empty object
}: DataVisualizationWidgetProps) {

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartType !== 'pie', // Often legend is more useful for bar/line
        position: 'top' as const,
      },
      title: {
        display: false, // CardTitle is used instead
      },
    },
    ...chartJsOptions, // Allow overriding with specific options
  };

  const pieChartOptions = { // Specific options for Pie charts
    ...baseChartOptions,
    plugins: {
        ...baseChartOptions.plugins,
        legend: {
            display: true, // Pie charts usually benefit from a legend
            position: 'right' as const,
            labels: { boxWidth: 12, padding: 15 }
        }
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[200px]"> {/* Increased min-height */}
          <BarChart2 className="h-10 w-10 text-gray-300 animate-pulse" />
          <p className="ml-2 text-gray-500">Loading chart data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4">
          <HelpCircle className="h-10 w-10 text-red-400 mb-2" />
          <p className="font-semibold text-red-600">Could not load chart</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      );
    }
    
    const noDataAvailable = (Array.isArray(data) && data.length === 0) || (chartType !== 'number' && !Array.isArray(data)) || (chartType === 'number' && typeof data !== 'number');

    if (noDataAvailable) {
         return (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4">
                <HelpCircle className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-500">No data available for this visualization.</p>
            </div>
        );
    }

    // Prepare data for Chart.js
    let chartData: any = {};
    if (Array.isArray(data)) {
      chartData = {
        labels: data.map(item => item.name),
        datasets: [{
          label: title, // Use widget title as default dataset label
          data: data.map(item => item.value),
          backgroundColor: chartType === 'pie' 
            ? data.map((item, index) => item.color || defaultChartColors[index % defaultChartColors.length])
            : (chartType === 'bar' ? defaultChartColors[0] : 'rgba(54, 162, 235, 0.2)'), // Bar color or Line area color
          borderColor: chartType === 'pie' 
            ? data.map(() => '#fff') // White borders for pie segments
            : defaultChartColors[0], // Line or Bar border color
          borderWidth: chartType === 'pie' ? 2 : 1,
          fill: chartType === 'line', // Fill area for line charts
          tension: chartType === 'line' ? 0.1 : undefined,
        }],
      };
    }


    switch (chartType) {
      case 'bar':
        return <Bar options={baseChartOptions} data={chartData} />;
      case 'pie':
        return <Pie options={pieChartOptions} data={chartData} />;
      case 'line':
        return <Line options={baseChartOptions} data={chartData} />;
      case 'number':
         return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="text-4xl font-bold text-gray-700">{Number(data).toLocaleString()}</div>
            </div>
         );
      default:
        return <p className="text-gray-500">Unknown chart type.</p>;
    }
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow min-h-[250px] p-2 sm:p-4"> {/* Increased min-height for charts */}
        {renderContent()}
      </CardContent>
    </Card>
  );
}

export default DataVisualizationWidget;
