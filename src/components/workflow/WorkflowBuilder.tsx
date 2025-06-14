"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import {
  PlayIcon,
  PauseIcon,
  PlusIcon,
  ArrowRightIcon,
  BoltIcon,
  EnvelopeIcon,
  FunnelIcon,
} from "@heroicons/react/24/solid"

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: "Lead Discovery Pipeline",
      status: "active",
      steps: [
        { type: "scraper", name: "Find Companies", icon: BoltIcon },
        { type: "filter", name: "Filter by Criteria", icon: FunnelIcon },
        { type: "email", name: "Send Introduction", icon: EnvelopeIcon },
      ],
      lastRun: "2 hours ago",
      success: 94,
    },
    {
      id: 2,
      name: "Market Research Flow",
      status: "paused",
      steps: [
        { type: "scraper", name: "Scrape Industry Data", icon: BoltIcon },
        { type: "filter", name: "Analyze Trends", icon: FunnelIcon },
      ],
      lastRun: "1 day ago",
      success: 87,
    },
  ])

  const toggleWorkflow = (id: number) => {
    setWorkflows(
      workflows.map((w) => (w.id === id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w)),
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-blue-500" />
            Automation Workflows
          </CardTitle>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">{workflow.name}</h4>
                  <p className="text-sm text-gray-600">Last run: {workflow.lastRun}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      workflow.status === "active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }
                  >
                    {workflow.status}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => toggleWorkflow(workflow.id)}>
                    {workflow.status === "active" ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {workflow.steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                      <step.icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">{step.name}</span>
                    </div>
                    {index < workflow.steps.length - 1 && <ArrowRightIcon className="w-4 h-4 text-gray-400 mx-2" />}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium text-green-600">{workflow.success}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
