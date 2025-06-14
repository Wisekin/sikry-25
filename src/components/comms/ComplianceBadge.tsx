import { Badge } from "@/src/components/ui/badge"
import { CheckCircle } from "lucide-react"

export function ComplianceBadge() {
  return (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
      <CheckCircle className="w-3 h-3 mr-1" />
      GDPR Compliant
    </Badge>
  )
}
