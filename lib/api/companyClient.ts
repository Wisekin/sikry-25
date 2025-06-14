import type { CompanyData } from "@/features/company-intel/hooks/useCompanyData"

class CompanyClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  async getCompany(id: string): Promise<CompanyData> {
    const response = await fetch(`${this.baseUrl}/companies/${id}`)

    if (!response.ok) {
      throw new Error("Failed to fetch company")
    }

    return response.json()
  }

  async enrichCompany(id: string): Promise<CompanyData> {
    const response = await fetch(`${this.baseUrl}/companies/${id}/enrich`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to enrich company")
    }

    return response.json()
  }

  async updateCompany(id: string, updates: Partial<CompanyData>): Promise<CompanyData> {
    const response = await fetch(`${this.baseUrl}/companies/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error("Failed to update company")
    }

    return response.json()
  }

  async getCompanies(filters?: any): Promise<{ companies: CompanyData[]; total: number }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })
    }

    const response = await fetch(`${this.baseUrl}/companies?${params}`)

    if (!response.ok) {
      throw new Error("Failed to fetch companies")
    }

    return response.json()
  }

  async deleteCompany(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/companies/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete company")
    }
  }

  async bulkImport(companies: Partial<CompanyData>[]): Promise<{ imported: number; errors: string[] }> {
    const response = await fetch(`${this.baseUrl}/companies/bulk-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ companies }),
    })

    if (!response.ok) {
      throw new Error("Failed to import companies")
    }

    return response.json()
  }
}

export const companyClient = new CompanyClient()
