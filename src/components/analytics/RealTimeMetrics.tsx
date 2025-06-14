"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { ClockIcon, SignalIcon } from "@heroicons/react/24/solid"

export function RealTimeMetrics() {
  const { t } = useTranslation("analyticsDashboard")
  const [metrics, setMetrics] = useState({
    activeScrapers: 8,
    dataPointsToday: 1247,
    successRate: 94.2,
    avgResponseTime: 1.8,
    trendsUp: 3,
    trendsDown: 1,
  })

  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive) {
        setMetrics((prev) => ({
          ...prev,
          dataPointsToday: prev.dataPointsToday + Math.floor(Math.random() * 5),
          successRate: Math.max(85, Math.min(99, prev.successRate + (Math.random() - 0.5) * 2)),
          avgResponseTime: Math.max(0.5, Math.min(5, prev.avgResponseTime + (Math.random() - 0.5) * 0.5)),
        }))
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const realTimeEvents = [
    { time: "2s", eventKey: "realTimeMetrics.events.extract", type: "success" },
    { time: "15s", eventKey: "realTimeMetrics.events.start", type: "info" },
    { time: "32s", eventKey: "realTimeMetrics.events.send", type: "success" },
    { time: "1m", eventKey: "realTimeMetrics.events.limit", type: "warning" },
    { time: "2m", eventKey: "realTimeMetrics.events.enrich", type: "success" },
  ].map(event => ({ ...event, event: t(event.eventKey), time: t('realTimeMetrics.ago', { time: event.time }) }));

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <SignalIcon className="w-5 h-5 text-green-500" />
              <span>{t('realTimeMetrics.title')}</span>
              {isLive && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">{t('realTimeMetrics.live')}</span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.activeScrapers}</div>
              <div className="text-sm text-gray-600">{t('realTimeMetrics.activeScrapers')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.dataPointsToday.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{t('realTimeMetrics.dataPointsToday')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">{t('realTimeMetrics.successRate')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.avgResponseTime.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">{t('realTimeMetrics.avgResponse')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-500" />
            {t('realTimeMetrics.activityFeed')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {realTimeEvents.map((event, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div
                  className={`w-2 h-2 rounded-full ${
                    event.type === "success"
                      ? "bg-green-500"
                      : event.type === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <span className="text-sm">{event.event}</span>
                </div>
                <span className="text-xs text-gray-500">{event.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
