"use client"

import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface Campaign {
  id: string
  name: string
  status: "draft" | "active" | "paused" | "completed"
  type: "email" | "linkedin" | "phone"
  recipients: number
  sent: number
  opened: number
  replied: number
  createdAt: string
  scheduledAt?: string
}

interface Template {
  id: string
  name: string
  type: "email" | "linkedin" | "phone"
  subject?: string
  content: string
  variables: string[]
  createdAt: string
  lastUsed?: string
}

interface CommsState {
  campaigns: Campaign[]
  templates: Template[]
  selectedCampaign: Campaign | null
  selectedTemplate: Template | null
  isLoading: boolean
  stats: {
    totalSent: number
    totalOpened: number
    totalReplied: number
    averageResponseRate: number
  }
}

interface CommsActions {
  setCampaigns: (campaigns: Campaign[]) => void
  setTemplates: (templates: Template[]) => void
  setSelectedCampaign: (campaign: Campaign | null) => void
  setSelectedTemplate: (template: Template | null) => void
  addCampaign: (campaign: Campaign) => void
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => void
  deleteCampaign: (campaignId: string) => void
  addTemplate: (template: Template) => void
  updateTemplate: (templateId: string, updates: Partial<Template>) => void
  deleteTemplate: (templateId: string) => void
  setLoading: (loading: boolean) => void
  setStats: (stats: CommsState["stats"]) => void
  reset: () => void
}

const initialState: CommsState = {
  campaigns: [],
  templates: [],
  selectedCampaign: null,
  selectedTemplate: null,
  isLoading: false,
  stats: {
    totalSent: 0,
    totalOpened: 0,
    totalReplied: 0,
    averageResponseRate: 0,
  },
}

export const useCommsStore = create<CommsState & CommsActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCampaigns: (campaigns) => set({ campaigns }),

      setTemplates: (templates) => set({ templates }),

      setSelectedCampaign: (selectedCampaign) => set({ selectedCampaign }),

      setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),

      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [...state.campaigns, campaign],
        })),

      updateCampaign: (campaignId, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((campaign) =>
            campaign.id === campaignId ? { ...campaign, ...updates } : campaign,
          ),
          selectedCampaign:
            state.selectedCampaign?.id === campaignId
              ? { ...state.selectedCampaign, ...updates }
              : state.selectedCampaign,
        })),

      deleteCampaign: (campaignId) =>
        set((state) => ({
          campaigns: state.campaigns.filter((campaign) => campaign.id !== campaignId),
          selectedCampaign: state.selectedCampaign?.id === campaignId ? null : state.selectedCampaign,
        })),

      addTemplate: (template) =>
        set((state) => ({
          templates: [...state.templates, template],
        })),

      updateTemplate: (templateId, updates) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId ? { ...template, ...updates } : template,
          ),
          selectedTemplate:
            state.selectedTemplate?.id === templateId
              ? { ...state.selectedTemplate, ...updates }
              : state.selectedTemplate,
        })),

      deleteTemplate: (templateId) =>
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== templateId),
          selectedTemplate: state.selectedTemplate?.id === templateId ? null : state.selectedTemplate,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setStats: (stats) => set({ stats }),

      reset: () => set(initialState),
    }),
    {
      name: "comms-store",
    },
  ),
)
