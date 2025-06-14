"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { getCompanies } from "@/src/actions/companies"
import type { DiscoveredCompany, Contact } from "@/src/types/database"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

// Dummy getContacts, replace with real import if available
async function getContacts() {
  // Replace with actual API call
  return [] as Contact[]
}

export interface CommunicationFiltersProps {
  onChange?: (filters: Record<string, any>) => void
}

export function CommunicationFilters({ onChange }: CommunicationFiltersProps) {
  const { t } = useTranslation("commsPage")
  const [status, setStatus] = useState<string>("")
  const [channel, setChannel] = useState<string>("")
  const [company, setCompany] = useState<string>("")
  const [contact, setContact] = useState<string>("")
  const [subject, setSubject] = useState<string>("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({ from: undefined, to: undefined })
  const [companies, setCompanies] = useState<DiscoveredCompany[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])

  const STATUS_OPTIONS = [
    { value: "pending", label: t("statusOptions.pending") },
    { value: "sent", label: t("statusOptions.sent") },
    { value: "delivered", label: t("statusOptions.delivered") },
    { value: "read", label: t("statusOptions.opened") },
    { value: "answered", label: t("statusOptions.replied") },
    { value: "failed", label: t("statusOptions.failed") },
  ]

  const CHANNEL_OPTIONS = [
    { value: "email", label: t("channelOptions.email") },
    { value: "sms", label: t("channelOptions.sms") },
    { value: "whatsapp", label: t("channelOptions.whatsapp") },
    { value: "call", label: t("channelOptions.call") },
    { value: "linkedin", label: t("channelOptions.linkedin") },
    { value: "other", label: t("channelOptions.other") },
  ]

  useEffect(() => {
    getCompanies().then(setCompanies)
    getContacts().then(setContacts)
  }, [])

  useEffect(() => {
    if (onChange) {
      onChange({
        status: status === "all" ? undefined : status,
        channel: channel === "all" ? undefined : channel,
        company_id: company === "all" ? undefined : company,
        contact_id: contact === "all" ? undefined : contact,
        subject: subject || undefined,
        sent_from: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        sent_to: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      })
    }
  }, [status, channel, company, contact, subject, dateRange, onChange])

  const formatDateRange = (range: { from: Date | undefined; to?: Date | undefined }) => {
    if (!range.from) return t("filters.datePlaceholder")
    if (!range.to) return format(range.from, "LLL dd, y")
    return `${format(range.from, "LLL dd, y")} - ${format(range.to, "LLL dd, y")}`
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("filters.status")}</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t("filters.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Channel */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("filters.channel")}</label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue placeholder={t("filters.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                {CHANNEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("filters.company")}</label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger>
                <SelectValue placeholder={t("filters.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("filters.contact")}</label>
            <Select value={contact} onValueChange={setContact}>
              <SelectTrigger>
                <SelectValue placeholder={t("filters.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("filters.subject")}</label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("search.subjectPlaceholder")}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("filters.sentDate")}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDateRange(dateRange)}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0" 
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <div className="bg-white rounded-md border shadow-lg p-2">
                  <DatePicker
                    selected={dateRange.from}
                    onChange={(dates) => {
                      const [start, end] = dates as [Date, Date]
                      setDateRange({ from: start, to: end })
                    }}
                    startDate={dateRange.from}
                    endDate={dateRange.to}
                    selectsRange
                    monthsShown={2}
                    inline
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="MMM d, yyyy"
                    className="border-none"
                    calendarClassName="border-none"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setStatus("all")
              setChannel("all")
              setCompany("all")
              setContact("all")
              setSubject("")
              setDateRange({ from: undefined, to: undefined })
            }}
          >
            {t("filters.resetButton")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CommunicationFilters
