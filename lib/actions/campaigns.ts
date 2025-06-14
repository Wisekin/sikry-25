"use server"

import { createClient } from "@/src/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCampaigns(status?: string) {
  const supabase = createClient()

  let query = supabase
    .from("campaigns")
    .select(`
      *,
      templates(name, type),
      messages(count)
    `)
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch campaigns: ${error.message}`)
  }

  return data
}

export async function getCampaign(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("campaigns")
    .select(`
      *,
      templates(*),
      messages(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch campaign: ${error.message}`)
  }

  return data
}

export async function createCampaign(formData: FormData) {
  const supabase = createClient()

  const campaignData = {
    name: formData.get("name") as string,
    template_id: formData.get("template_id") as string,
    type: formData.get("type") as string,
    target_filters: JSON.parse((formData.get("target_filters") as string) || "{}"),
    status: "draft",
  }

  const { data, error } = await supabase.from("campaigns").insert(campaignData).select().single()

  if (error) {
    throw new Error(`Failed to create campaign: ${error.message}`)
  }

  revalidatePath("/comms/campaigns")
  return data
}

export async function updateCampaignStatus(id: string, status: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("campaigns")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update campaign: ${error.message}`)
  }

  revalidatePath("/comms/campaigns")
  return data
}

export async function getTemplates(type?: string) {
  const supabase = createClient()

  let query = supabase.from("templates").select("*").order("created_at", { ascending: false })

  if (type) {
    query = query.eq("type", type)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch templates: ${error.message}`)
  }

  return data
}

export async function createTemplate(formData: FormData) {
  const supabase = createClient()

  const templateData = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    category: formData.get("category") as string,
    subject: formData.get("subject") as string,
    content: formData.get("content") as string,
    variables: JSON.parse((formData.get("variables") as string) || "[]"),
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
  }

  const { data, error } = await supabase.from("templates").insert(templateData).select().single()

  if (error) {
    throw new Error(`Failed to create template: ${error.message}`)
  }

  revalidatePath("/comms/templates")
  return data
}
