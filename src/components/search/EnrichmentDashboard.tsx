import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { BarChart as LucideBarChart, ListChecks, FileText, Zap } from 'lucide-react'; // Renamed BarChart to avoid conflict
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Added Filler for area charts if needed
} from 'chart.js';

// Register Chart.js components
import { ExportButton } from './ExportButton'; // Added ExportButton

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- CSV Export Utility --- (Integrated directly for this example)
function downloadDataAsCSV(data: any[], filename: string = 'export.csv') {
  if (!data || data.length === 0) {
    console.warn("No data to export or data is empty.");
    return false; // Indicate failure or no action
  }
  try {
    const replacer = (_key: string, value: any) => value === null || typeof value === 'undefined' ? '' : String(value).includes(',') ? `"${String(value)}"` : String(value);
    const header = Object.keys(data[0]);
    const csvRows = [
      header.join(','), // Header row
      ...data.map(row => header.map(fieldName => replacer(fieldName, row[fieldName])).join(','))
    ];
    const csvString = csvRows.join('\r\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true; // Indicate success
    } else {
      console.error("Browser does not support link.download attribute.");
      return { error: "Browser does not support direct download." };
    }
  } catch (e) {
    console.error("Error generating CSV:", e);
    return { error: e instanceof Error ? e.message : "Unknown error during CSV generation." };
  }
}
// --- End CSV Export Utility ---


// Placeholder data types - these would come from actual data aggregation
interface EnrichmentStat {
  label: string;
  value: string | number;
  icon?: React.ElementType;
}

interface RecentActivity {
  id: string;
  companyName: string;
  activityType: 'discovered' | 'scraped' | 'enriched' | 'error';
  timestamp: Date;
  details?: string;
}

const StatCard: React.FC<EnrichmentStat> = ({ label, value, icon: Icon }) => (
  <Card className="flex-1 min-w-[200px]">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{label}</CardTitle>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
    </CardContent>
  </Card>
);

export function EnrichmentDashboard() {
  // Placeholder data - in a real app, this would come from a store or API
  const enrichmentStats: EnrichmentStat[] = [
    { label: 'Total Companies Enriched', value: '1,234', icon: Zap },
    { label: 'Websites Discovered', value: '3,456', icon: ListChecks },
    { label: 'Scraping Jobs Executed', value: '5,678', icon: FileText },
    { label: 'Average Enrichment Rate', value: '75%', icon: LucideBarChart }, // Use renamed icon
  ];

  const recentActivities: RecentActivity[] = [
    { id: '1', companyName: 'Acme Corp', activityType: 'enriched', timestamp: new Date(), details: '5 new contacts found' },
    { id: '2', companyName: 'Beta Ltd', activityType: 'scraped', timestamp: new Date(Date.now() - 3600000), details: 'beta.com scraped' },
    { id: '3', companyName: 'Gamma Inc', activityType: 'error', timestamp: new Date(Date.now() - 7200000), details: 'Failed to discover website' },
    { id: '4', companyName: 'Delta Co', activityType: 'discovered', timestamp: new Date(Date.now() - 10800000), details: 'delta.co identified' },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Enrichment Dashboard</h1>
        <ExportButton
          onExport={async (format) => {
            if (format === 'csv') {
              // For demonstration, export recentActivities
              // In a real app, this data might be fetched or passed as props
              const dataToExport = recentActivities.map(act => ({
                company: act.companyName,
                activity: act.activityType,
                details: act.details || '',
                time: act.timestamp.toISOString(),
              }));
              return downloadDataAsCSV(dataToExport, 'enrichment_activity.csv');
            }
            // Placeholder for other formats
            console.log(`Exporting as ${format} (not implemented for this demo)`);
            return { error: `${format.toUpperCase()} export not implemented yet.`};
          }}
          fileName="enrichment_dashboard_data"
        >
          Export Dashboard Data
        </ExportButton>
      </div>

      {/* Stats Section */}
      <div className="flex flex-wrap gap-4">
        {enrichmentStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Enrichment Activity</CardTitle>
          <CardDescription>Overview of the latest discovery and scraping events.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <ul className="space-y-3">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">
                      {activity.companyName} - <span className={`capitalize font-semibold ${
                        activity.activityType === 'enriched' ? 'text-green-600' :
                        activity.activityType === 'error' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>{activity.activityType}</span>
                    </p>
                    {activity.details && <p className="text-xs text-muted-foreground">{activity.details}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.timestamp.toLocaleTimeString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent activity.</p>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for more charts/data visualizations */}
      <Card>
        <CardHeader>
          <CardTitle>Enrichment Trends</CardTitle>
          <CardDescription>Trend of companies enriched over the last 7 days (mock data).</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <Line data={enrichmentTrendData} options={chartOptions} />
        </CardContent>
      </Card>

    </div>
  );
}

// Mock data and options for the chart
const chartLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
const enrichmentTrendData = {
  labels: chartLabels,
  datasets: [
    {
      label: 'Companies Enriched',
      data: [12, 19, 15, 22, 18, 25, 20], // Mock data points
      fill: true,
      borderColor: 'rgb(54, 162, 235)', // Blue
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      tension: 0.1,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false, // Title is in CardHeader
      text: 'Enrichment Trends',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0 // Ensure whole numbers for counts
      }
    },
  },
};


export default EnrichmentDashboard;
