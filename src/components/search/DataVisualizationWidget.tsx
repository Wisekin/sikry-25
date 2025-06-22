import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { BarChart2, PieChart, LineChart, HelpCircle } from 'lucide-react'; // Example icons
import { cn } from '@/lib/utils';
// Define generic types for chart data - this would be more specific based on charting library
type ChartType = 'bar' | 'pie' | 'line' | 'number'; // 'number' for displaying a single stat

interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: any; // For additional properties like colors, categories for stacked charts etc.
}

interface DataVisualizationWidgetProps {
  title: string;
  description?: string;
  chartType: ChartType;
  data: ChartDataItem[] | number; // Array for most charts, single number for 'number' type
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  // Config options specific to chart types could be added here
  // e.g., xAxisKey, yAxisKey, colorScheme, etc.
}

export function DataVisualizationWidget({
  title,
  description,
  chartType,
  data,
  isLoading = false,
  error = null,
  className,
}: DataVisualizationWidgetProps) {

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[150px]">
          <BarChart2 className="h-10 w-10 text-gray-300 animate-pulse" /> {/* Placeholder icon */}
          <p className="ml-2 text-gray-500">Loading chart data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center p-4">
          <HelpCircle className="h-10 w-10 text-red-400 mb-2" />
          <p className="font-semibold text-red-600">Could not load chart</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      );
    }

    if ((Array.isArray(data) && data.length === 0) || (typeof data === 'number' && isNaN(data)) ) {
         return (
            <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center p-4">
                <HelpCircle className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-500">No data available for this visualization.</p>
            </div>
        );
    }


    // Placeholder for actual chart rendering
    // In a real app, you'd use a charting library like Recharts, Chart.js, Nivo, etc.
    switch (chartType) {
      case 'bar':
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <BarChart2 className="w-12 h-12 mr-2" /> Mock Bar Chart for "{title}"
          </div>
        );
      case 'pie':
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <PieChart className="w-12 h-12 mr-2" /> Mock Pie Chart for "{title}"
          </div>
        );
      case 'line':
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <LineChart className="w-12 h-12 mr-2" /> Mock Line Chart for "{title}"
          </div>
        );
      case 'number':
         return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="text-4xl font-bold text-gray-700">{Number(data).toLocaleString()}</div>
            </div>
         )
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
      <CardContent className="flex-grow min-h-[200px] p-2 sm:p-4"> {/* Ensure content area can grow and has min height */}
        {renderContent()}
      </CardContent>
    </Card>
  );
}

export default DataVisualizationWidget;
