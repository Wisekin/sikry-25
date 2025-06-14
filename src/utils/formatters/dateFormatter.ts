import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns"

export function formatDate(date: string | Date, formatStr = "MMM dd, yyyy"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, formatStr)
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, "MMM dd, yyyy HH:mm")
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date

  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, "HH:mm")}`
  }

  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, "HH:mm")}`
  }

  return formatDistanceToNow(dateObj, { addSuffix: true })
}

export function formatTimeAgo(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }

  return `${remainingSeconds}s`
}

export function formatBusinessHours(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  const hour = dateObj.getHours()

  if (hour >= 9 && hour < 17) {
    return "Business hours"
  } else if (hour >= 17 && hour < 22) {
    return "Evening"
  } else {
    return "After hours"
  }
}

export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function formatTimezone(date: string | Date, timezone: string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj)
}
