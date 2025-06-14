"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Switch } from "@/src/components/ui/switch"
import { Badge } from "@/src/components/ui/badge"
import { Plus, Edit, Trash2, Clock, Mail, MessageSquare, Phone, CheckSquare } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import type { LeadResponseRule } from "@/src/types/lead-response"

export function LeadResponseRulesManager() {
  const [rules, setRules] = useState<LeadResponseRule[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRule, setEditingRule] = useState<LeadResponseRule | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const response = await fetch("/api/lead-response/rules")
      const data = await response.json()
      if (data.success) {
        setRules(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch rules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRule = async (ruleData: Partial<LeadResponseRule>) => {
    try {
      const url = editingRule ? `/api/lead-response/rules/${editingRule.id}` : "/api/lead-response/rules"
      const method = editingRule ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData),
      })

      const data = await response.json()
      if (data.success) {
        await fetchRules()
        setIsDialogOpen(false)
        setEditingRule(null)
      }
    } catch (error) {
      console.error("Failed to save rule:", error)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return

    try {
      const response = await fetch(`/api/lead-response/rules/${ruleId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        await fetchRules()
      }
    } catch (error) {
      console.error("Failed to delete rule:", error)
    }
  }

  const toggleRuleStatus = async (rule: LeadResponseRule) => {
    await handleSaveRule({ ...rule, is_active: !rule.is_active })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Response Rules</h2>
          <p className="text-muted-foreground">Configure automated responses for new leads</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRule(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRule ? "Edit Rule" : "Create New Rule"}</DialogTitle>
              <DialogDescription>Configure how leads should be automatically contacted</DialogDescription>
            </DialogHeader>
            <LeadResponseRuleForm rule={editingRule} onSave={handleSaveRule} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {rule.name}
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{rule.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleRuleStatus(rule)}>
                    <Switch checked={rule.is_active} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingRule(rule)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Trigger Sources</h4>
                  <div className="flex flex-wrap gap-1">
                    {rule.trigger_sources.map((source) => (
                      <Badge key={source} variant="outline">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Response Actions</h4>
                  <div className="flex gap-2">
                    {rule.send_email && (
                      <Badge variant="outline">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Badge>
                    )}
                    {rule.send_sms && (
                      <Badge variant="outline">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        SMS
                      </Badge>
                    )}
                    {rule.make_call && (
                      <Badge variant="outline">
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Badge>
                    )}
                    {rule.create_task && (
                      <Badge variant="outline">
                        <CheckSquare className="w-3 h-3 mr-1" />
                        Task
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Response Time</h4>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(rule.response_delay_seconds / 60)} minutes</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="text-sm text-muted-foreground">
                    {rule.total_triggered} triggered, {rule.successful_responses} successful
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function LeadResponseRuleForm({
  rule,
  onSave,
}: {
  rule: LeadResponseRule | null
  onSave: (data: Partial<LeadResponseRule>) => void
}) {
  const [formData, setFormData] = useState<Partial<LeadResponseRule>>(
    rule || {
      name: "",
      description: "",
      is_active: true,
      priority: 1,
      trigger_sources: [],
      response_delay_seconds: 300,
      max_response_delay_seconds: 1800,
      send_email: true,
      send_sms: false,
      make_call: false,
      create_task: true,
      auto_assign: true,
      respect_business_hours: true,
      business_hours_start: "09:00:00",
      business_hours_end: "17:00:00",
      business_days: [1, 2, 3, 4, 5],
      timezone: "UTC",
      max_retry_attempts: 3,
      retry_delay_minutes: 15,
      escalate_on_failure: true,
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Rule Name</Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="response_delay">Response Delay (minutes)</Label>
        <Input
          id="response_delay"
          type="number"
          value={Math.floor((formData.response_delay_seconds || 300) / 60)}
          onChange={(e) => setFormData({ ...formData, response_delay_seconds: Number.parseInt(e.target.value) * 60 })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="send_email"
            checked={formData.send_email || false}
            onCheckedChange={(checked) => setFormData({ ...formData, send_email: checked })}
          />
          <Label htmlFor="send_email">Send Email</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="send_sms"
            checked={formData.send_sms || false}
            onCheckedChange={(checked) => setFormData({ ...formData, send_sms: checked })}
          />
          <Label htmlFor="send_sms">Send SMS</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="make_call"
            checked={formData.make_call || false}
            onCheckedChange={(checked) => setFormData({ ...formData, make_call: checked })}
          />
          <Label htmlFor="make_call">Make Call</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="create_task"
            checked={formData.create_task || false}
            onCheckedChange={(checked) => setFormData({ ...formData, create_task: checked })}
          />
          <Label htmlFor="create_task">Create Task</Label>
        </div>
      </div>

      <Button type="submit" className="w-full">
        {rule ? "Update Rule" : "Create Rule"}
      </Button>
    </form>
  )
}
