"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Eye, Reply, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { updateCommunicationStatus } from "@/src/actions/communications"
import type { Communication } from "@/src/types/database"

interface CommunicationsTableProps {
  communications: Communication[]
  onRefresh: () => void
}

export function CommunicationsTable({ communications, onRefresh }: CommunicationsTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      setUpdating(id)
      await updateCommunicationStatus(id, status)
      onRefresh()
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "read":
        return "bg-purple-100 text-purple-800"
      case "answered":
        return "bg-emerald-100 text-emerald-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return "📧"
      case "sms":
        return "📱"
      case "whatsapp":
        return "💬"
      case "linkedin":
        return "💼"
      default:
        return "📞"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communications History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {communications.map((communication) => (
              <TableRow key={communication.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{communication.contact?.name || "Unknown Contact"}</div>
                    <div className="text-sm text-muted-foreground">{communication.contact?.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{communication.company?.name || "Unknown Company"}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{getChannelIcon(communication.channel)}</span>
                    <span className="capitalize">{communication.channel}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">
                    {communication.subject || communication.content.substring(0, 50) + "..."}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(communication.status)}>{communication.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {communication.sent_at ? new Date(communication.sent_at).toLocaleDateString() : "Not sent"}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {communication.status === "delivered" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(communication.id, "read")}
                          disabled={updating === communication.id}
                        >
                          Mark as Opened
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Reply className="mr-2 h-4 w-4" />
                        Reply
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
