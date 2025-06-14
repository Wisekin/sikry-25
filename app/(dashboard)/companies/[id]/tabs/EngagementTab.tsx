import { ChannelSelector } from "@/src/components/comms/ChannelSelector"
import { EngagementTimeline } from "@/src/components/company/EngagementTimeline"

interface EngagementTabProps {
  companyId: string
}

export function EngagementTab({ companyId }: EngagementTabProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <EngagementTimeline companyId={companyId} />
      </div>
      <div>
        <ChannelSelector />
      </div>
    </div>
  )
}
