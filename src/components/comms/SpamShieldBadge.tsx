import { Badge } from "@/src/components/ui/badge"
import { Shield } from "lucide-react"

export function SpamShieldBadge() {
  return (
    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
      <Shield className="w-3 h-3 mr-1" />
      Spam Shield Active
    </Badge>
  )
}
