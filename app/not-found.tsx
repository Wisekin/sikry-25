import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Search, Home } from "lucide-react"
import { Heading } from "@/src/components/core/typography/Heading"
import { Text } from "@/src/components/core/typography/Text"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-floating">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-white" />
          </div>
          <CardTitle>
            <Heading level={2}>Page Not Found</Heading>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Text className="text-secondary">The page you're looking for doesn't exist or has been moved.</Text>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/search">
                <Search className="w-4 h-4 mr-2" />
                Search Companies
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
