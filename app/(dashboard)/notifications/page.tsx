import { NotificationCenter } from "@/src/components/notifications/NotificationCenter"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"

export const metadata = {
  title: "Notifications | SIKRY",
  description: "View and manage your notifications",
}

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">View and manage your notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationCenter />
        </CardContent>
      </Card>
    </div>
  )
} 