export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          domain: string
          location_text: string
          industry: string
          employees: string
          description: string
          logo_url: string | null
          confidence_score: number
          created_at: string
          updated_at: string
          last_scraped: string | null
        }
        Insert: {
          id?: string
          name: string
          domain: string
          location_text?: string
          industry?: string
          employees?: string
          description?: string
          logo_url?: string | null
          confidence_score?: number
          created_at?: string
          updated_at?: string
          last_scraped?: string | null
        }
        Update: {
          id?: string
          name?: string
          domain?: string
          location_text?: string
          industry?: string
          employees?: string
          description?: string
          logo_url?: string | null
          confidence_score?: number
          created_at?: string
          updated_at?: string
          last_scraped?: string | null
        }
      } // closes companies
      extracted_data: {
        Row: {
          id: string
          company_id: string
          emails: string[] | null
          phones: string[] | null
          technologies: string[] | null
          social_links: Json | null
        } // closes Row for extracted_data
        Insert: {
          id?: string
          company_id: string
          emails?: string[] | null
          phones?: string[] | null
          technologies?: string[] | null
          social_links?: Json | null
        } // closes Insert for extracted_data
        Update: {
          id?: string
          company_id?: string
          emails?: string[] | null
          phones?: string[] | null
          technologies?: string[] | null
          social_links?: Json | null
        } // closes Update for extracted_data
      } // closes extracted_data
    } // closes Tables
  } // closes public
} // closes Database
