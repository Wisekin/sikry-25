"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid"
import { useRouter } from "next/navigation"

export function NotificationCenter() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Scraper Completed",
      message: "LinkedIn scraper finished with 95% success rate",
      time: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "Rate Limit Warning",
      message: "Approaching API rate limit for Google Maps",
      time: "15 minutes ago",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "New Feature Available",
      message: "AI-powered lead scoring is now available",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 4,
      type: "error",
      title: "Scraper Failed",
      message: "Website structure changed, scraper needs update",
      time: "2 hours ago",
      read: false,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) =>
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))

  const markAllAsRead = () =>
    setNotifications(notifications.map((n) => ({ ...n, read: true })))

  const removeNotification = (id: number) =>
    setNotifications(notifications.filter((n) => n.id !== id))

  const getIcon = (type: string) => {
    const base = "w-5 h-5 p-1 rounded-full"
    switch (type) {
      case "success":
        return <CheckCircleIcon className={`${base} text-green-600 bg-green-100`} />
      case "warning":
        return <ExclamationTriangleIcon className={`${base} text-yellow-600 bg-yellow-100`} />
      case "error":
        return <ExclamationTriangleIcon className={`${base} text-red-600 bg-red-100`} />
      case "info":
        return <InformationCircleIcon className={`${base} text-blue-600 bg-blue-100`} />
      default:
        return <InformationCircleIcon className={`${base} text-gray-600 bg-gray-100`} />
    }
  }

  if (!isOpen) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="relative hover:bg-[#2A3050]"
        >
          <BellIcon className="h-5 w-5 text-[#FFFFFF]" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed top-16 right-4 z-50">
      <Card className="border-0 shadow-2xl rounded-xl bg-[#1E223A]/80 text-white backdrop-blur-md w-[280px]">
        <CardHeader className="pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
              Notifications
            </CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead} 
                  className="text-white hover:bg-[var(--sidebar-hover)] hover:text-white ml-2"
                >
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Tout lire
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:text-red-400 text-white hover:bg-[var(--sidebar-hover)] hover:text-white">
                <XMarkIcon className="w-4 h-4 " />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-[300px] overflow-y-auto scrollbar-custom">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-white/60">Aucune notification</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors duration-200 border-b border-white/10 hover:bg-[#2A3050]/60 ${
                    !notification.read ? "bg-[#3C4568]/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm text-white">{notification.title}</h4>
                          <p className="text-sm text-white/80 mt-1">{notification.message}</p>
                          <p className="text-xs text-white/50 mt-2">{notification.time}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              className="text-white hover:text-green-400 p-1 text-white hover:bg-[var(--sidebar-hover)] hover:text-white"
                            >
                              <CheckIcon className="w-4 h-4 " />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeNotification(notification.id)}
                            className="text-white hover:text-red-400 p-1 text-white hover:bg-[var(--sidebar-hover)] hover:text-white"
                          >
                            <XMarkIcon className="w-4 h-4 " />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>

        <CardFooter className="p-0 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full py-3 text-sm text-white hover:text-primary/20 hover:bg-[#2A3050]/60"
            onClick={() => {
              setIsOpen(false)
              router.push('/notifications')
            }}
          >
            View all notifications
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
