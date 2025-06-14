"use server"

import { createClient } from "@/src/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from 'next/headers'

export async function getCompanies(filters?: {
  industry?: string
  location?: string
  size?: string
  search?: string
  confidence_min?: number
}) {
  console.log('[Companies] Getting companies with filters:', filters);
  
  try {
    console.log('[Companies] Creating Supabase client...');
    const supabase = await createClient()
    
    // Check cookies for debugging
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('[Companies] Cookies present:', allCookies.map(c => c.name));
    
    // Get the current session with detailed logging
    console.log('[Companies] Fetching auth session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    console.log('[Companies] Auth response:', {
      hasSessionData: !!sessionData,
      hasSession: !!sessionData?.session,
      error: sessionError?.message
    });
    
    if (sessionError) {
      console.error('[Companies] Session error:', sessionError);
      throw new Error("Authentication error: " + sessionError.message)
    }

    if (!sessionData?.session) {
      console.error('[Companies] No session found');
      throw new Error("No active session found")
    }

    const { session } = sessionData;
    console.log('[Companies] Valid session found for user:', {
      userId: session.user.id,
      email: session.user.email
    });

    // Get team member info with detailed logging
    console.log('[Companies] Looking up team member for user:', session.user.id);
    const { data: teamMember, error: teamError } = await supabase
      .from("team_members")
      .select("organization_id")
      .eq("user_id", session.user.id)
      .single();

    if (teamError) {
      console.error('[Companies] Team member lookup error:', teamError);
      throw new Error("Failed to verify organization membership: " + teamError.message);
    }

    if (!teamMember) {
      console.error('[Companies] No team member found for user:', session.user.id);
      throw new Error("User is not associated with any organization");
    }

    console.log('[Companies] Found team member in organization:', teamMember.organization_id);

    // Build the query with all filters
    let query = supabase
      .from("discovered_companies")
      .select("*")
      .eq("organization_id", teamMember.organization_id);

    // Apply filters
    if (filters?.industry) {
      console.log('[Companies] Applying industry filter:', filters.industry);
      query = query.eq("industry", filters.industry);
    }

    if (filters?.location) {
      console.log('[Companies] Applying location filter:', filters.location);
      query = query.ilike("location_text", `%${filters.location}%`);
    }

    if (filters?.size) {
      console.log('[Companies] Applying size filter:', filters.size);
      query = query.eq("company_size", filters.size);
    }

    if (filters?.confidence_min) {
      console.log('[Companies] Applying confidence score filter:', filters.confidence_min);
      query = query.gte("confidence_score", filters.confidence_min);
    }

    if (filters?.search) {
      console.log('[Companies] Applying search filter:', filters.search);
      query = query.or(`name.ilike.%${filters.search}%,domain.ilike.%${filters.search}%`);
    }

    // Execute query
    console.log('[Companies] Executing query...');
    const { data: companies, error: queryError } = await query.order("created_at", { ascending: false });

    if (queryError) {
      console.error('[Companies] Query error:', queryError);
      throw new Error("Failed to fetch companies: " + queryError.message);
    }

    console.log('[Companies] Successfully fetched companies:', {
      count: companies?.length || 0,
      organizationId: teamMember.organization_id
    });

    return companies || [];
  } catch (error) {
    console.error('[Companies] Error in getCompanies:', error);
    throw error;
  }
}

export async function getCompany(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("discovered_companies")
    .select(`
      *,
      contacts(*),
      communications(*),
      insights(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch company: ${error.message}`)
  }

  return data
}

export async function createCompany(formData: FormData) {
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

  const companyData = {
    organization_id: teamMember.organization_id,
    name: formData.get("name") as string,
    domain: (formData.get("domain") as string) || null,
    description: (formData.get("description") as string) || null,
    industry: (formData.get("industry") as string) || null,
    location_text: (formData.get("location") as string) || null,
    company_size: (formData.get("size") as string) || null,
    source_url: (formData.get("source_url") as string) || "manual_entry",
    confidence_score: Number.parseFloat(formData.get("confidence_score") as string) || 0.5,
    company_status: "active",
    tags_list: JSON.parse((formData.get("tags") as string) || "[]"),
    internal_notes: (formData.get("notes") as string) || null,
  }

  const { data, error } = await supabase.from("discovered_companies").insert(companyData).select().single()

  if (error) {
    throw new Error(`Failed to create company: ${error.message}`)
  }

  revalidatePath("/companies")
  return data
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = await createClient()

  const updateData = {
    name: formData.get("name") as string,
    domain: (formData.get("domain") as string) || null,
    description: (formData.get("description") as string) || null,
    industry: (formData.get("industry") as string) || null,
    location_text: (formData.get("location") as string) || null,
    company_size: (formData.get("size") as string) || null,
    confidence_score: Number.parseFloat(formData.get("confidence_score") as string),
    tags_list: JSON.parse((formData.get("tags") as string) || "[]"),
    internal_notes: (formData.get("notes") as string) || null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("discovered_companies").update(updateData).eq("id", id).select().single()

  if (error) {
    throw new Error(`Failed to update company: ${error.message}`)
  }

  revalidatePath("/companies")
  revalidatePath(`/companies/${id}`)
  return data
}

export async function deleteCompany(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("discovered_companies").delete().eq("id", id)

  if (error) {
    throw new Error(`Failed to delete company: ${error.message}`)
  }

  revalidatePath("/companies")
}

export async function getCompanyStats() {
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

  const [{ count: totalCompanies }, { count: highConfidence }, { count: recentlyScraped }, { count: contacted }] =
    await Promise.all([
      supabase
        .from("discovered_companies")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", teamMember.organization_id),
      supabase
        .from("discovered_companies")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", teamMember.organization_id)
        .gte("confidence_score", 0.9),
      supabase
        .from("discovered_companies")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", teamMember.organization_id)
        .gte("last_scraped_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("contacts").select("*", { count: "exact", head: true }).not("last_contacted_at", "is", null),
    ])

  return {
    totalCompanies: totalCompanies || 0,
    highConfidence: highConfidence || 0,
    recentlyScraped: recentlyScraped || 0,
    contacted: contacted || 0,
  }
}
