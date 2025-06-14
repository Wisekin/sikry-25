"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Switch } from "@/src/components/ui/switch"
import { Plus, Trash2, Eye, Save } from "lucide-react"
import type { VSLPage, Testimonial } from "@/src/types/vsl"

interface VSLPageBuilderProps {
  page?: VSLPage
  onSave: (pageData: Partial<VSLPage>) => Promise<void>
  onPreview: (pageData: Partial<VSLPage>) => void
}

export function VSLPageBuilder({ page, onSave, onPreview }: VSLPageBuilderProps) {
  const [formData, setFormData] = useState<Partial<VSLPage>>(
    page || {
      name: "",
      title: "",
      headline: "",
      template_type: "standard",
      primary_color: "#3B82F6",
      secondary_color: "#1E40AF",
      background_type: "solid",
      cta_text: "Get Started Now",
      cta_button_color: "#10B981",
      bullet_points: [],
      testimonials: [],
      is_published: false,
      requires_opt_in: false,
      collect_phone: false,
      collect_company: false,
    },
  )

  const [saving, setSaving] = useState(false)

  const handleInputChange = (field: keyof VSLPage, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addBulletPoint = () => {
    const bulletPoints = [...(formData.bullet_points || [])]
    bulletPoints.push("")
    handleInputChange("bullet_points", bulletPoints)
  }

  const updateBulletPoint = (index: number, value: string) => {
    const bulletPoints = [...(formData.bullet_points || [])]
    bulletPoints[index] = value
    handleInputChange("bullet_points", bulletPoints)
  }

  const removeBulletPoint = (index: number) => {
    const bulletPoints = [...(formData.bullet_points || [])]
    bulletPoints.splice(index, 1)
    handleInputChange("bullet_points", bulletPoints)
  }

  const addTestimonial = () => {
    const testimonials = [...(formData.testimonials || [])]
    testimonials.push({ name: "", content: "", company: "", rating: 5 })
    handleInputChange("testimonials", testimonials)
  }

  const updateTestimonial = (index: number, field: keyof Testimonial, value: any) => {
    const testimonials = [...(formData.testimonials || [])]
    testimonials[index] = { ...testimonials[index], [field]: value }
    handleInputChange("testimonials", testimonials)
  }

  const removeTestimonial = (index: number) => {
    const testimonials = [...(formData.testimonials || [])]
    testimonials.splice(index, 1)
    handleInputChange("testimonials", testimonials)
  }

  const handleSave = async () => {
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  return (
    <div>
      {/* Page Name */}
      <div className="mb-4">
        <Label htmlFor="name">Page Name</Label>
        <Input id="name" value={formData.name || ""} onChange={(e) => handleInputChange("name", e.target.value)} />
      </div>

      {/* Title */}
      <div className="mb-4">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={formData.title || ""} onChange={(e) => handleInputChange("title", e.target.value)} />
      </div>

      {/* Headline */}
      <div className="mb-4">
        <Label htmlFor="headline">Headline</Label>
        <Textarea
          id="headline"
          value={formData.headline || ""}
          onChange={(e) => handleInputChange("headline", e.target.value)}
        />
      </div>

      {/* Template Type */}
      <div className="mb-4">
        <Label htmlFor="template_type">Template Type</Label>
        <Select
          id="template_type"
          value={formData.template_type || "standard"}
          onChange={(e) => handleInputChange("template_type", e.target.value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select template type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Colors */}
      <div className="mb-4">
        <Label htmlFor="primary_color">Primary Color</Label>
        <Input
          id="primary_color"
          type="color"
          value={formData.primary_color || "#3B82F6"}
          onChange={(e) => handleInputChange("primary_color", e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="secondary_color">Secondary Color</Label>
        <Input
          id="secondary_color"
          type="color"
          value={formData.secondary_color || "#1E40AF"}
          onChange={(e) => handleInputChange("secondary_color", e.target.value)}
        />
      </div>

      {/* Background Type */}
      <div className="mb-4">
        <Label htmlFor="background_type">Background Type</Label>
        <Select
          id="background_type"
          value={formData.background_type || "solid"}
          onChange={(e) => handleInputChange("background_type", e.target.value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select background type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CTA Text */}
      <div className="mb-4">
        <Label htmlFor="cta_text">CTA Text</Label>
        <Input
          id="cta_text"
          value={formData.cta_text || "Get Started Now"}
          onChange={(e) => handleInputChange("cta_text", e.target.value)}
        />
      </div>

      {/* CTA Button Color */}
      <div className="mb-4">
        <Label htmlFor="cta_button_color">CTA Button Color</Label>
        <Input
          id="cta_button_color"
          type="color"
          value={formData.cta_button_color || "#10B981"}
          onChange={(e) => handleInputChange("cta_button_color", e.target.value)}
        />
      </div>

      {/* Bullet Points */}
      <div className="mb-4">
        <Label>Bullet Points</Label>
        <div className="flex flex-col">
          {formData.bullet_points?.map((point, index) => (
            <div key={index} className="flex items-center mb-2">
              <Input value={point} onChange={(e) => updateBulletPoint(index, e.target.value)} />
              <Button variant="ghost" onClick={() => removeBulletPoint(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addBulletPoint}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bullet Point
          </Button>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-4">
        <Label>Testimonials</Label>
        <div className="flex flex-col">
          {formData.testimonials?.map((testimonial, index) => (
            <div key={index} className="flex flex-col mb-4">
              <Input
                placeholder="Name"
                value={testimonial.name}
                onChange={(e) => updateTestimonial(index, "name", e.target.value)}
              />
              <Textarea
                placeholder="Content"
                value={testimonial.content}
                onChange={(e) => updateTestimonial(index, "content", e.target.value)}
              />
              <Input
                placeholder="Company"
                value={testimonial.company}
                onChange={(e) => updateTestimonial(index, "company", e.target.value)}
              />
              <Input
                placeholder="Rating"
                type="number"
                value={testimonial.rating}
                onChange={(e) => updateTestimonial(index, "rating", Number.parseInt(e.target.value))}
              />
              <Button variant="ghost" onClick={() => removeTestimonial(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addTestimonial}>
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </div>
      </div>

      {/* Publish Settings */}
      <div className="mb-4">
        <Label htmlFor="is_published">Publish</Label>
        <Switch
          id="is_published"
          checked={formData.is_published || false}
          onCheckedChange={(checked) => handleInputChange("is_published", checked)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="requires_opt_in">Requires Opt-in</Label>
        <Switch
          id="requires_opt_in"
          checked={formData.requires_opt_in || false}
          onCheckedChange={(checked) => handleInputChange("requires_opt_in", checked)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="collect_phone">Collect Phone</Label>
        <Switch
          id="collect_phone"
          checked={formData.collect_phone || false}
          onCheckedChange={(checked) => handleInputChange("collect_phone", checked)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="collect_company">Collect Company</Label>
        <Switch
          id="collect_company"
          checked={formData.collect_company || false}
          onCheckedChange={(checked) => handleInputChange("collect_company", checked)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => onPreview(formData)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button variant="default" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}
