"use client"

import { useState } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"
import { Badge } from "@/src/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Plus, Mail, MessageSquare, Clock, GitBranch, Zap, ArrowRight } from "lucide-react"
import type { FunnelBuilderStep, Funnel } from "@/src/types/funnels"

interface FunnelBuilderProps {
  funnel?: Funnel
  onSave: (funnelData: any) => void
  onCancel: () => void
}

export function FunnelBuilder({ funnel, onSave, onCancel }: FunnelBuilderProps) {
  const [funnelData, setFunnelData] = useState({
    name: funnel?.name || "",
    description: funnel?.description || "",
    funnel_type: funnel?.funnel_type || "lead_nurture",
    trigger_conditions: funnel?.trigger_conditions || {},
    steps: funnel?.steps || [],
  })

  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [draggedStep, setDraggedStep] = useState<string | null>(null)

  const stepTypes = [
    { type: "email", label: "Email", icon: Mail, color: "bg-blue-500" },
    { type: "sms", label: "SMS", icon: MessageSquare, color: "bg-green-500" },
    { type: "wait", label: "Wait", icon: Clock, color: "bg-yellow-500" },
    { type: "condition", label: "Condition", icon: GitBranch, color: "bg-purple-500" },
    { type: "action", label: "Action", icon: Zap, color: "bg-orange-500" },
  ]

  const addStep = (type: string) => {
    const newStep = {
      id: `step_${Date.now()}`,
      type,
      name: `New ${type} step`,
      config: {},
      position: { x: 100, y: funnelData.steps.length * 120 + 100 },
      connections: {},
    }

    setFunnelData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }))
  }

  const updateStep = (stepId: string, updates: any) => {
    setFunnelData((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)),
    }))
  }

  const deleteStep = (stepId: string) => {
    setFunnelData((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== stepId),
    }))
    setSelectedStep(null)
  }

  const handleSave = () => {
    onSave(funnelData)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{funnel ? "Edit Funnel" : "Create New Funnel"}</h2>
            <p className="text-muted-foreground">Build automated lead nurturing sequences</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{funnel ? "Update Funnel" : "Create Funnel"}</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/30">
          <Tabs defaultValue="settings" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="steps">Steps</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Funnel Name</Label>
                <Input
                  id="name"
                  value={funnelData.name}
                  onChange={(e) => setFunnelData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter funnel name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={funnelData.description}
                  onChange={(e) => setFunnelData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this funnel's purpose"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Funnel Type</Label>
                <Select
                  value={funnelData.funnel_type}
                  onValueChange={(value) => setFunnelData((prev) => ({ ...prev, funnel_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead_nurture">Lead Nurture</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="reactivation">Reactivation</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="retention">Retention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Trigger Conditions */}
              <div className="space-y-2">
                <Label>Trigger Conditions</Label>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm text-muted-foreground">Configure when contacts enter this funnel</p>
                    {/* Add trigger condition UI here */}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="steps" className="p-4 space-y-4">
              <div>
                <h3 className="font-medium mb-3">Add Step</h3>
                <div className="grid grid-cols-2 gap-2">
                  {stepTypes.map((stepType) => {
                    const Icon = stepType.icon
                    return (
                      <Button
                        key={stepType.type}
                        variant="outline"
                        size="sm"
                        className="h-auto p-3 flex flex-col gap-1"
                        onClick={() => addStep(stepType.type)}
                      >
                        <div className={`p-1 rounded ${stepType.color} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs">{stepType.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Step List */}
              <div className="space-y-2">
                <h3 className="font-medium">Steps ({funnelData.steps.length})</h3>
                {funnelData.steps.map((step, index) => (
                  <Card
                    key={step.id}
                    className={`cursor-pointer transition-colors ${
                      selectedStep === step.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedStep(step.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{step.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{step.type}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-grid-pattern">
          <div className="absolute inset-0 p-4">
            {funnelData.steps.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">No steps yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first step from the sidebar to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {funnelData.steps.map((step, index) => {
                  const stepType = stepTypes.find((t) => t.type === step.type)
                  const Icon = stepType?.icon || Mail

                  return (
                    <Card
                      key={step.id}
                      className={`w-64 cursor-pointer transition-all ${
                        selectedStep === step.id ? "ring-2 ring-primary shadow-lg" : ""
                      }`}
                      onClick={() => setSelectedStep(step.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded ${stepType?.color} text-white`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{step.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{step.type} step</p>
                          </div>
                          <Badge variant="outline">{index + 1}</Badge>
                        </div>

                        {step.type === "email" && (
                          <p className="text-xs text-muted-foreground">
                            Template: {step.config.template_id || "Not set"}
                          </p>
                        )}

                        {step.type === "wait" && (
                          <p className="text-xs text-muted-foreground">Delay: {step.config.delay_days || 1} days</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step Configuration Panel */}
        {selectedStep && (
          <div className="w-80 border-l bg-muted/30">
            <StepConfigPanel
              step={funnelData.steps.find((s) => s.id === selectedStep)!}
              onUpdate={(updates) => updateStep(selectedStep, updates)}
              onDelete={() => deleteStep(selectedStep)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function StepConfigPanel({
  step,
  onUpdate,
  onDelete,
}: {
  step: FunnelBuilderStep
  onUpdate: (updates: any) => void
  onDelete: () => void
}) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Configure Step</h3>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="step-name">Step Name</Label>
        <Input id="step-name" value={step.name} onChange={(e) => onUpdate({ name: e.target.value })} />
      </div>

      {step.type === "email" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            <Select
              value={step.config.template_id || ""}
              onValueChange={(value) =>
                onUpdate({
                  config: { ...step.config, template_id: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Welcome Email</SelectItem>
                <SelectItem value="followup">Follow-up Email</SelectItem>
                <SelectItem value="nurture">Nurture Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={step.config.subject || ""}
              onChange={(e) =>
                onUpdate({
                  config: { ...step.config, subject: e.target.value },
                })
              }
              placeholder="Email subject"
            />
          </div>
        </div>
      )}

      {step.type === "wait" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delay">Delay (days)</Label>
            <Input
              id="delay"
              type="number"
              value={step.config.delay_days || 1}
              onChange={(e) =>
                onUpdate({
                  config: { ...step.config, delay_days: Number.parseInt(e.target.value) },
                })
              }
              min="1"
            />
          </div>
        </div>
      )}

      {step.type === "condition" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition-type">Condition Type</Label>
            <Select
              value={step.config.condition_type || ""}
              onValueChange={(value) =>
                onUpdate({
                  config: { ...step.config, condition_type: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engagement">Engagement Score</SelectItem>
                <SelectItem value="response">Email Response</SelectItem>
                <SelectItem value="time">Time-based</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
