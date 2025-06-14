"use client"

import { useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { Text } from "@/src/components/core/typography/Text"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Text className="text-gray-600">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </Text>
          {error.digest && (
            <Text size="sm" className="text-gray-500 font-mono bg-gray-100 p-2 rounded">
              Error ID: {error.digest}
            </Text>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="bg-primary text-white hover:bg-primary/90">
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <HomeIcon className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
