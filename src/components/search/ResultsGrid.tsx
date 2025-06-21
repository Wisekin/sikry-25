import { Company } from "@/src/lib/types"
import { CompanyCard } from "./CompanyCard"

interface ResultsGridProps {
  companies: Company[]
  layout?: "grid" | "list"
}

export function ResultsGrid({ companies, layout = "grid" }: ResultsGridProps) {
  if (layout === 'list') {
    return (
      <div className="space-y-3">
        {companies.map(company => (
          <CompanyCard key={company.id} company={company} layout="list" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {companies.map(company => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
