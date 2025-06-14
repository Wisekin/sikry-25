import { Badge } from "@/src/components/ui/badge"
import { Mail, Phone, Code, MapPin, Building, Globe, User } from "lucide-react"

interface DataFieldPillProps {
  type: "email" | "phone" | "technology" | "address" | "company" | "website" | "person"
  value: string
  confidence?: number
}

export function DataFieldPill({ type, value, confidence }: DataFieldPillProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "email":
        return { icon: Mail, color: "bg-blue-50 text-blue-700 border-blue-200", label: "Email" }
      case "phone":
        return { icon: Phone, color: "bg-green-50 text-green-700 border-green-200", label: "Phone" }
      case "technology":
        return { icon: Code, color: "bg-purple-50 text-purple-700 border-purple-200", label: "Tech" }
      case "address":
        return { icon: MapPin, color: "bg-amber-50 text-amber-700 border-amber-200", label: "Address" }
      case "company":
        return { icon: Building, color: "bg-green-50 text-green-700 border-green-200", label: "Company" }
      case "website":
        return { icon: Globe, color: "bg-cyan-50 text-cyan-700 border-cyan-200", label: "Website" }
      case "person":
        return { icon: User, color: "bg-slate-50 text-slate-700 border-slate-200", label: "Person" }
      default:
        return { icon: Code, color: "bg-gray-50 text-gray-700 border-gray-200", label: "Data" }
    }
  }

  const config = getTypeConfig(type)
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={`${config.color} text-xs font-medium flex items-center gap-1 max-w-fit`}
      title={confidence ? `${config.label}: ${confidence}% confidence` : config.label}
    >
      <Icon className="w-3 h-3" />
      <span className="truncate max-w-24">{value}</span>
      {confidence && <span className="text-xs opacity-70">{confidence}%</span>}
    </Badge>
  )
}
