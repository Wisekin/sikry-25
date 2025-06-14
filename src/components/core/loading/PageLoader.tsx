import { LoadingSpinner } from "./LoadingSpinner"
import { Text } from "@/src/components/core/typography/Text"

interface PageLoaderProps {
  message?: string
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <Text className="text-secondary">{message}</Text>
      </div>
    </div>
  )
}
