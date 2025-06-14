import { Loader2 } from "lucide-react"
import { Card } from "@/src/components/ui/card"
import { Skeleton } from "@/src/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-2/3">
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="lg:w-1/3">
          <Card className="h-[200px]">
            <Skeleton className="h-full w-full" />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-3">
          <Card className="h-[600px]">
            <Skeleton className="h-full w-full" />
          </Card>
        </aside>

        <main className="lg:col-span-9">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        </main>
      </div>
    </div>
  )
}
