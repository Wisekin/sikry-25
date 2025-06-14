"use server"

import { createClient } from "@/src/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCommunications(filters?: {
  campaign_id?: string
  contact_id?: string
  status?: string
  type?: string
}) {
  const supabase = await createClient()

  // Get current user's organization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Unauthorized")
  }

  const { data: teamMember, error: teamError } = await supabase
    .from("team_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single()

  if (teamError || !teamMember) {
    throw new Error("User not part of any organization")
  }

  let query = supabase
    .from("communications")
    .select(`
      *,
      contacts(*),
      campaigns(*)
    `)
    .eq("organization_id", teamMember.organization_id)
    .order("created_at", { ascending: false })

  if (filters?.campaign_id) {
    query = query.eq("campaign_id", filters.campaign_id)
  }

  if (filters?.contact_id) {
    query = query.eq("contact_id", filters.contact_id)
  }

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.type) {
    query = query.eq("communication_type", filters.type)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch communications: ${error.message}`)
  }

  return data || []
}

export async function createCommunication(formData: FormData) {
  const supabase = await createClient()

  // Get current user's organization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Unauthorized")
  }

  const { data: teamMember, error: teamError } = await supabase
    .from("team_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single()

  if (teamError || !teamMember) {
    throw new Error("User not part of any organization")
  }

  const communicationData = {
    organization_id: teamMember.organization_id,
    contact_id: formData.get("contact_id") as string,
    campaign_id: (formData.get("campaign_id") as string) || null,
    communication_type: formData.get("type") as string,
    subject: (formData.get("subject") as string) || null,
    content: formData.get("content") as string,
    status: "pending",
    scheduled_at: formData.get("scheduled_at") ? new Date(formData.get("scheduled_at") as string).toISOString() : null,
    metadata: JSON.parse((formData.get("metadata") as string) || "{}"),
  }

  const { data, error } = await supabase.from("communications").insert(communicationData).select().single()

  if (error) {
    throw new Error(`Failed to create communication: ${error.message}`)
  }

  revalidatePath("/comms")
  return data
}

export async function updateCommunicationStatus(id: string, status: string, metadata?: any) {
  const supabase = await createClient()

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === "sent") {
    updateData.sent_at = new Date().toISOString()
  } else if (status === "delivered") {
    updateData.delivered_at = new Date().toISOString()
  } else if (status === "opened") {
    updateData.opened_at = new Date().toISOString()
  } else if (status === "replied") {
    updateData.replied_at = new Date().toISOString()
  }

  if (metadata) {
    updateData.metadata = metadata
  }

  const { data, error } = await supabase.from("communications").update(updateData).eq("id", id).select().single()

  if (error) {
    throw new Error(`Failed to update communication: ${error.message}`)
  }

  revalidatePath("/comms")
  return data
}

export async function getCommunicationStats() {
  const supabase = await createClient()

  // Get current user's organization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Unauthorized")
  }

  const { data: teamMember, error: teamError } = await supabase
    .from("team_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single()

  if (teamError || !teamMember) {
    throw new Error("User not part of any organization")
  }

  const [{ count: totalSent }, { count: delivered }, { count: opened }, { count: replied }] = await Promise.all([
    supabase
      .from("communications")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", teamMember.organization_id)
      .eq("status", "sent"),
    supabase
      .from("communications")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", teamMember.organization_id)
      .eq("status", "delivered"),
    supabase
      .from("communications")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", teamMember.organization_id)
      .eq("status", "opened"),
    supabase
      .from("communications")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", teamMember.organization_id)
      .eq("status", "replied"),
  ])

  return {
    totalSent: totalSent || 0,
    delivered: delivered || 0,
    opened: opened || 0,
    replied: replied || 0,
    deliveryRate: totalSent ? Math.round(((delivered || 0) / totalSent) * 100) : 0,
    openRate: delivered ? Math.round(((opened || 0) / delivered) * 100) : 0,
    replyRate: opened ? Math.round(((replied || 0) / opened) * 100) : 0,
  }
}
