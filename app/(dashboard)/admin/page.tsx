"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  UserGroupIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  ServerIcon,
  BellAlertIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"

// --- Helper component for chart tooltips
const CustomTooltip = ({ active, payload, label, t }: any) => { // Added t as prop
  if (active && payload && payload.length) {
    const unit = payload[0].dataKey === 'ms' ? t('customTooltip.msUnit') : (payload[0].dataKey === 'rate' ? t('customTooltip.percentageUnit') : '');
    return (
      <div className="p-2 bg-gray-700 text-white rounded-md shadow-lg text-xs">
        <p className="font-bold">{`${payload[0].value}${unit}`}</p>
      </div>
    );
  }
  return null;
};

export default function AdminPage() {
  const { t } = useTranslation('adminPage');
  const [detailedSectionsOpen, setDetailedSectionsOpen] = useState(false);

  const adminSections = [
    {
      title: t('sections.teamManagement.title'),
      description: t('sections.teamManagement.description'),
      icon: UserGroupIcon,
      href: "/admin/team",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: t('sections.billingUsage.title'),
      description: t('sections.billingUsage.description'),
      icon: CreditCardIcon,
      href: "/admin/billing",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: t('sections.securitySettings.title'),
      description: t('sections.securitySettings.description'),
      icon: ShieldCheckIcon,
      href: "/admin/security",
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: t('sections.compliance.title'),
      description: t('sections.compliance.description'),
      icon: DocumentTextIcon,
      href: "/admin/compliance",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const recentActivities = [
    {
      user: "Sarah Johnson",
      action: t('recentActivity.actions.updatedPermissions', { user: 'Mark Wilson' }),
      time: "10m ago", // Time kept as mock data
      icon: UserGroupIcon,
    },
    {
      user: "System", // User kept as mock data
      action: t('recentActivity.actions.completedScan'),
      time: "1h ago",
      icon: ShieldCheckIcon,
    },
    {
      user: "Mark Wilson",
      action: t('recentActivity.actions.updatedBilling'),
      time: "3h ago",
      icon: CreditCardIcon,
    },
    {
      user: "System",
      action: t('recentActivity.actions.detectedRisk'),
      time: "Yesterday",
      icon: BellAlertIcon,
    },
  ];

  const systemMetricsData = {
    api: {
      name: t('systemMetrics.api.name'),
      value: "156ms",
      change: "-12%",
      trend: "down",
      data: [
        { t: 't-6', ms: 180 }, { t: 't-5', ms: 175 }, { t: 't-4', ms: 190 },
        { t: 't-3', ms: 160 }, { t: 't-2', ms: 165 }, { t: 't-1', ms: 158 },
        { t: 't-0', ms: 156 },
      ],
      color: "hsl(142.1 76.2% 42.2%)" // Green
    },
    cpu: {
      name: t('systemMetrics.cpu.name'),
      value: "42%",
      change: "+3%",
      trend: "up",
      data: [
        { t: 't-6', usage: 35 }, { t: 't-5', usage: 38 }, { t: 't-4', usage: 37 },
        { t: 't-3', usage: 40 }, { t: 't-2', usage: 45 }, { t: 't-1', usage: 43 },
        { t: 't-0', usage: 42 },
      ],
      color: "hsl(38.3 95.8% 53.1%)" // Amber
    },
    memory: {
      name: t('systemMetrics.memory.name'),
      value: "68%",
      change: "+2%",
      trend: "up",
      data: [
        { t: 't-6', usage: 60 }, { t: 't-5', usage: 62 }, { t: 't-4', usage: 61 },
        { t: 't-3', usage: 65 }, { t: 't-2', usage: 66 }, { t: 't-1', usage: 67 },
        { t: 't-0', usage: 68 },
      ],
      color: "hsl(38.3 95.8% 53.1%)" // Amber
    },
    errors: {
        name: t('systemMetrics.errors.name'),
        value: "0.02%",
        change: "-5%",
        trend: "down",
        data: [
            { t: 't-6', rate: 0.05 }, { t: 't-5', rate: 0.04 }, { t: 't-4', rate: 0.06 },
            { t: 't-3', rate: 0.03 }, { t: 't-2', rate: 0.02 }, { t: 't-1', rate: 0.03 },
            { t: 't-0', rate: 0.02 },
        ],
        color: "hsl(142.1 76.2% 42.2%)" // Green
    }
  };

  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 text-[#1B1F3B] p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">{t('header.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('header.subtitle')}
          </p>
        </div>
        <Button size="lg" className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2">
          <Cog6ToothIcon className="w-5 h-5" />
          <span>{t('header.button')}</span>
        </Button>
      </div>
      
      {/* --- NEW: STYLISH EXPANDABLE SECTION FOR TABS --- */}
      <div className="space-y-2">
        <Button
            variant="outline"
            className="w-full md:w-auto bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-[#1B1F3B] flex items-center gap-2"
            onClick={() => setDetailedSectionsOpen(!detailedSectionsOpen)}
        >
            <AdjustmentsHorizontalIcon className="w-5 h-5"/>
            <span>{t('detailedSections.button')}</span>
            <ChevronRightIcon className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${detailedSectionsOpen ? 'rotate-90' : ''}`} />
        </Button>

        <div className={`transition-all duration-500 ease-in-out grid ${detailedSectionsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <Card className="bg-white border-none shadow-sm mt-2">
                  <Tabs defaultValue="users" className="p-4">
                    <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100 p-1 rounded-lg max-w-md">
                      <TabsTrigger value="users" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">{t('tabs.users')}</TabsTrigger>
                      <TabsTrigger value="security" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">{t('tabs.security')}</TabsTrigger>
                      <TabsTrigger value="billing" className="text-gray-600 data-[state=active]:bg-[#3C4568] data-[state=active]:text-white rounded-md">{t('tabs.billing')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users">
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold">{t('tabs.users_content.title')}</h3>
                        <p className="text-gray-600">{t('tabs.users_content.description')}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="security">
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold">{t('tabs.security_content.title')}</h3>
                        <p className="text-gray-600">{t('tabs.security_content.description')}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="billing">
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold">{t('tabs.billing_content.title')}</h3>
                        <p className="text-gray-600">{t('tabs.billing_content.description')}</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
            </div>
        </div>
      </div>


      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('quickStats.totalUsers.title')}</CardTitle>
            <UserGroupIcon className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B1F3B]">12</div>
            <p className="text-xs text-green-600 flex items-center gap-1">{t('quickStats.totalUsers.change')}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('quickStats.monthlyUsage.title')}</CardTitle>
            <CreditCardIcon className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B1F3B]">$2,450</div>
            <p className="text-xs text-gray-500">{t('quickStats.monthlyUsage.description')}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('quickStats.complianceScore.title')}</CardTitle>
            <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">100%</div>
            <p className="text-xs text-gray-500">{t('quickStats.complianceScore.description')}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('quickStats.systemHealth.title')}</CardTitle>
            <ServerIcon className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">99.98%</div>
            <p className="text-xs text-gray-500">{t('quickStats.systemHealth.description')}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Admin Sections */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">{t('adminSections.title')}</CardTitle>
                <CardDescription>{t('adminSections.description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {adminSections.map((section) => (
                <Link href={section.href} key={section.title} className="group">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-[#3C4568] hover:shadow-md hover:bg-gray-50/50 transition-all duration-300 flex items-start gap-4">
                    <div className={`w-10 h-10 flex-shrink-0 ${section.bgColor} rounded-lg flex items-center justify-center`}>
                      <section.icon className={`w-6 h-6 ${section.iconColor}`} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-800 group-hover:text-[#1B1F3B]">{section.title}</h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600">{section.description}</p>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-[#1B1F3B] transition-colors" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClockIcon className="w-5 h-5 text-gray-500" /> {t('recentActivity.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <activity.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-700">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-[#1B1F3B]">
                {t('recentActivity.button')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status Section with Dynamic Charts */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <ServerIcon className="w-5 h-5 mr-2 text-gray-500" /> {t('systemStatus.title')}
          </CardTitle>
          <CardDescription>{t('systemStatus.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(systemMetricsData).map(([key, metric]) => (
            <div key={key} className="p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-gray-300 transition-all duration-300">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-600">{metric.name}</span>
                <span className={`text-xs font-semibold flex items-center ${metric.trend === 'down' ? 'text-green-600' : 'text-amber-600'}`}>
                    {metric.trend === 'down' ? <ArrowTrendingDownIcon className="w-3 h-3 mr-0.5" /> : <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" />}
                    {metric.change}
                </span>
              </div>
              <div className="font-bold text-2xl text-[#1B1F3B] mb-2">{metric.value}</div>
              <div className="h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metric.data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <Tooltip content={<CustomTooltip t={t} />} cursor={{ stroke: 'rgba(100,100,100,0.3)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <defs>
                        <linearGradient id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metric.color} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={metric.color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey={key === 'api' ? 'ms' : (key === 'errors' ? 'rate' : 'usage')}
                      stroke={metric.color}
                      strokeWidth={2}
                      fill={`url(#color-${key})`}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}