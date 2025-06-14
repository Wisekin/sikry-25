"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { CalendarIcon, ClockIcon, UserIcon, EnvelopeIcon } from "@heroicons/react/24/solid"

interface ScheduleMeetingProps {
  companyName?: string
  contactEmail?: string
  onClose?: () => void
}

export function ScheduleMeeting({ companyName = "", contactEmail = "", onClose }: ScheduleMeetingProps) {
  const [formData, setFormData] = useState({
    recipientEmail: contactEmail,
    recipientName: "",
    subject: `Interview Opportunity - ${companyName}`,
    meetingType: "video",
    duration: "30",
    preferredDate: "",
    preferredTime: "",
    message: `Hi there,

I hope this email finds you well. I'm reaching out regarding a potential interview opportunity with ${companyName}.

We're impressed with your company's work and would love to discuss how we might collaborate. Would you be available for a brief 30-minute conversation to explore this further?

I'm flexible with timing and can accommodate your schedule. Please let me know what works best for you.

Looking forward to hearing from you.

Best regards,`,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSendInvite = () => {
    // Here you would integrate with your email service
    console.log("Sending meeting invite:", formData)
    alert("Meeting invitation sent successfully!")
    onClose?.()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          Schedule Interview Meeting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipient Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipientEmail" className="flex items-center gap-1">
              <EnvelopeIcon className="w-4 h-4" />
              Recipient Email
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => handleInputChange("recipientEmail", e.target.value)}
              placeholder="contact@company.com"
            />
          </div>
          <div>
            <Label htmlFor="recipientName" className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" />
              Recipient Name
            </Label>
            <Input
              id="recipientName"
              value={formData.recipientName}
              onChange={(e) => handleInputChange("recipientName", e.target.value)}
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Meeting Details */}
        <div>
          <Label htmlFor="subject">Email Subject</Label>
          <Input id="subject" value={formData.subject} onChange={(e) => handleInputChange("subject", e.target.value)} />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="meetingType">Meeting Type</Label>
            <Select value={formData.meetingType} onValueChange={(value) => handleInputChange("meetingType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="in-person">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="duration" className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              Duration (minutes)
            </Label>
            <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="preferredDate">Preferred Date</Label>
            <Input
              id="preferredDate"
              type="date"
              value={formData.preferredDate}
              onChange={(e) => handleInputChange("preferredDate", e.target.value)}
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        {/* Meeting Link Options */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Meeting Link Options</h4>
          <div className="grid md:grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              📹 Generate Zoom Link
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              📞 Generate Teams Link
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              🎥 Generate Meet Link
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSendInvite} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            Send Interview Invitation
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>

        {/* Preview */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Email Preview</h4>
          <div className="text-sm space-y-1">
            <div>
              <strong>To:</strong> {formData.recipientEmail}
            </div>
            <div>
              <strong>Subject:</strong> {formData.subject}
            </div>
            <div>
              <strong>Meeting:</strong> {formData.meetingType} call for {formData.duration} minutes
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
