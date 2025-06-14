"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { CheckCircleIcon, PlayIcon, BookOpenIcon, ArrowRightIcon } from "@heroicons/react/24/solid"

export function QuickStartGuide() {
  const [completedSteps, setCompletedSteps] = useState([1])

  const steps = [
    {
      id: 1,
      title: "Welcome to SIKRY",
      description: "Learn the basics of our intelligence platform",
      action: "Watch intro video",
      completed: true,
    },
    {
      id: 2,
      title: "Create Your First Scraper",
      description: "Set up automated data collection",
      action: "Start tutorial",
      completed: false,
    },
    {
      id: 3,
      title: "Import Company Database",
      description: "Upload or connect your existing data",
      action: "Import data",
      completed: false,
    },
    {
      id: 4,
      title: "Set Up Communication",
      description: "Configure email and messaging channels",
      action: "Configure channels",
      completed: false,
    },
    {
      id: 5,
      title: "Launch Your First Campaign",
      description: "Start reaching out to prospects",
      action: "Create campaign",
      completed: false,
    },
  ]

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  const progress = (completedSteps.length / steps.length) * 100

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-blue-500" />
          Quick Start Guide
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-gray-600">
          {completedSteps.length} of {steps.length} steps completed
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.id)
            const isNext =
              !isCompleted &&
              step.id === Math.min(...steps.filter((s) => !completedSteps.includes(s.id)).map((s) => s.id))

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isCompleted
                    ? "bg-green-50 border-green-200"
                    : isNext
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isNext ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
                      }`}
                    >
                      <span className="text-xs font-medium">{step.id}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <div>
                  {isCompleted ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Done
                    </Badge>
                  ) : isNext ? (
                    <Button size="sm" onClick={() => completeStep(step.id)} className="bg-blue-600 hover:bg-blue-700">
                      <PlayIcon className="w-3 h-3 mr-1" />
                      {step.action}
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      {step.action}
                      <ArrowRightIcon className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
