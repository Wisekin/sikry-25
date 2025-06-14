"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Heading } from "@/src/components/core/typography/Heading"
import { Text } from "@/src/components/core/typography/Text"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const reset = () => {
        this.setState({ hasError: false, error: undefined })
      }

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={reset} />
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-floating">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <CardTitle>
                <Heading level={2}>Something went wrong</Heading>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Text className="text-secondary">
                An unexpected error occurred in this component. Please try refreshing the page.
              </Text>
              <Button onClick={reset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
