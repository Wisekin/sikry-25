import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Skeleton } from "@/src/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"

export default function TemplatesLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
          <TabsTrigger value="all">All Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-48" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
