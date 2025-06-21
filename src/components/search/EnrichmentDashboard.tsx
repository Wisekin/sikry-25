import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, ListChecks, FileText, Zap } from 'lucide-react'; // Example Icons

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
    { label: 'Average Enrichment Rate', value: '75%', icon: BarChart },
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
        {/* Add date range picker or other global filters here */}
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
          <CardTitle>Enrichment Trends (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-muted-foreground">Chart visualizations will be here.</p>
        </CardContent>
      </Card>

    </div>
  );
}

export default EnrichmentDashboard;
