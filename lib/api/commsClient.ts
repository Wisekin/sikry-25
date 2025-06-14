import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface Campaign {
  id: string
  name: string
  status: "draft" | "active" | "paused" | "completed"
  type: "email" | "linkedin" | "phone"
  template_id: string
  target_count: number
  sent_count: number
  open_rate: number
  response_rate: number
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  name: string
  type: "email" | "linkedin" | "phone"
  subject?: string
  content: string
  variables: string[]
  spam_score: number
  created_at: string
}

export interface Message {
  id: string
  campaign_id: string
  company_id: string
  type: "email" | "linkedin" | "phone"
  status: "pending" | "sent" | "delivered" | "opened" | "replied" | "failed"
  content: string
  sent_at?: string
  opened_at?: string
  replied_at?: string
}

export const commsClient = {
  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async getCampaign(id: string): Promise<Campaign | null> {
    const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async createCampaign(campaign: Omit<Campaign, "id" | "created_at" | "updated_at">): Promise<Campaign> {
    const { data, error } = await supabase.from("campaigns").insert(campaign).select().single()

    if (error) throw error
    return data
  },

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const { data, error } = await supabase
      .from("campaigns")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Templates
  async getTemplates(): Promise<Template[]> {
    const { data, error } = await supabase.from("templates").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createTemplate(template: Omit<Template, "id" | "created_at">): Promise<Template> {
    const { data, error } = await supabase.from("templates").insert(template).select().single()

    if (error) throw error
    return data
  },

  // Messages
  async getMessages(campaignId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("sent_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async sendMessage(message: Omit<Message, "id" | "sent_at">): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert({ ...message, sent_at: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Analytics
  async getCampaignStats(campaignId: string) {
    const { data, error } = await supabase.from("messages").select("status").eq("campaign_id", campaignId)

    if (error) throw error

    const stats = data?.reduce(
      (acc, message) => {
        acc[message.status] = (acc[message.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: data?.length || 0,
      sent: stats?.sent || 0,
      delivered: stats?.delivered || 0,
      opened: stats?.opened || 0,
      replied: stats?.replied || 0,
      failed: stats?.failed || 0,
    }
  },
}
