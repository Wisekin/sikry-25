import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { BarChart2, PieChart as PieIcon, LineChart as LineIcon, HelpCircle } from 'lucide-react';
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
  Title as ChartJsTitle, // Renamed to avoid conflict with CardTitle
  Tooltip as ChartJsTooltip, // Renamed
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  ChartJsTitle,
  ChartJsTooltip,
  Legend,
  Filler
);

type ChartType = 'bar' | 'pie' | 'line' | 'number';

export interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

interface DataVisualizationWidgetProps {
  title: string; // Assumed to be already translated when passed as a prop
  description?: string; // Assumed to be already translated
  chartType: ChartType;
  data: ChartDataItem[] | number;
  isLoading?: boolean;
  error?: string | null; // Error messages might need to be translation keys or translated before passing
  className?: string;
  chartJsOptions?: any;
}

const defaultChartColors = [
  'rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)',
  'rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
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
  chartJsOptions = {},
}: DataVisualizationWidgetProps) {
  const { t } = useTranslation('searchPage');

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: chartType !== 'pie', position: 'top' as const },
      title: { display: false }, // CardTitle is used
    },
    ...chartJsOptions,
  };

  const pieChartOptions = {
    ...baseChartOptions,
    plugins: {
        ...baseChartOptions.plugins,
        legend: { display: true, position: 'right' as const, labels: { boxWidth: 12, padding: 15 } }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[200px]">
          <BarChart2 className="h-10 w-10 text-gray-300 dark:text-slate-600 animate-pulse" />
          <p className="ml-2 text-gray-500 dark:text-slate-400">{t('dataVisualizationWidget.loading')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4">
          <HelpCircle className="h-10 w-10 text-red-400 mb-2" />
          <p className="font-semibold text-red-600 dark:text-red-400">{t('dataVisualizationWidget.errorTitle')}</p>
          <p className="text-xs text-red-500 dark:text-red-500">{error}</p> {/* Assuming error is a displayable message */}
        </div>
      );
    }
    
    const noDataAvailable = (Array.isArray(data) && data.length === 0) || (chartType !== 'number' && !Array.isArray(data)) || (chartType === 'number' && typeof data !== 'number');

    if (noDataAvailable) {
         return (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4">
                <HelpCircle className="h-10 w-10 text-gray-400 dark:text-slate-500 mb-2" />
                <p className="text-gray-500 dark:text-slate-400">{t('dataVisualizationWidget.noData')}</p>
            </div>
        );
    }

    let chartData: any = {};
    if (Array.isArray(data)) {
      chartData = {
        labels: data.map(item => item.name), // Assuming item.name does not need translation here or is pre-translated
        datasets: [{
          label: title, // Already translated prop
          data: data.map(item => item.value),
          backgroundColor: chartType === 'pie' 
            ? data.map((item, index) => item.color || defaultChartColors[index % defaultChartColors.length])
            : (chartType === 'bar' ? defaultChartColors[0] : 'rgba(54, 162, 235, 0.2)'),
          borderColor: chartType === 'pie' 
            ? data.map(() => '#fff')
            : defaultChartColors[0],
          borderWidth: chartType === 'pie' ? 2 : 1,
          fill: chartType === 'line',
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
                <div className="text-4xl font-bold text-gray-700 dark:text-slate-200">{Number(data).toLocaleString()}</div>
            </div>
         );
      default:
        return <p className="text-gray-500 dark:text-slate-400">{t('dataVisualizationWidget.unknownChartType')}</p>;
    }
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow min-h-[250px] p-2 sm:p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}

export default DataVisualizationWidget;
