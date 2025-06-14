"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { useTranslation } from "react-i18next"
import { Gift, Users, DollarSign, Share2, Copy, Mail, CheckCircle, Clock, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ReferralDashboard() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [referrals, setReferrals] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [newReferralEmail, setNewReferralEmail] = useState("")

  useEffect(() => {
    loadReferrals()
    loadStats()
  }, [])

  const loadReferrals = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/referrals")
      const result = await response.json()

      if (result.success) {
        setReferrals(result.data || [])
      }
    } catch (error) {
      console.error("Error loading referrals:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch("/api/referrals/stats")
      const result = await response.json()

      if (result.success) {
        setStats(result.data || {})
      }
    } catch (error) {
      console.error("Error loading referral stats:", error)
    }
  }

  const createReferral = async () => {
    if (!newReferralEmail) return

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referred_email: newReferralEmail }),
      })

      const result = await response.json()

      if (result.success) {
        setNewReferralEmail("")
        await loadReferrals()
        await loadStats()
        toast({
          title: t("referrals.success"),
          description: t("referrals.referralCreated"),
        })
      } else {
        toast({
          title: t("common.error"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating referral:", error)
      toast({
        title: t("common.error"),
        description: t("referrals.createError"),
        variant: "destructive",
      })
    }
  }

  const copyReferralLink = (code: string) => {
    const link = `${window.location.origin}/signup?ref=${code}`
    navigator.clipboard.writeText(link)
    toast({
      title: t("referrals.linkCopied"),
      description: t("referrals.linkCopiedDescription"),
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed_up":
      case "activated":
      case "rewarded":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "expired":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed_up":
      case "activated":
      case "rewarded":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.total_referrals || 0}</div>
                <div className="text-sm text-muted-foreground">{t("referrals.totalReferrals")}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.successful_referrals || 0}</div>
                <div className="text-sm text-muted-foreground">{t("referrals.successful")}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">${stats.total_rewards_earned || 0}</div>
                <div className="text-sm text-muted-foreground">{t("referrals.rewardsEarned")}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{Math.round(stats.conversion_rate || 0)}%</div>
                <div className="text-sm text-muted-foreground">{t("referrals.conversionRate")}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Referral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {t("referrals.inviteFriends")}
          </CardTitle>
          <CardDescription>{t("referrals.inviteDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder={t("referrals.emailPlaceholder")}
              value={newReferralEmail}
              onChange={(e) => setNewReferralEmail(e.target.value)}
              type="email"
            />
            <Button onClick={createReferral} disabled={!newReferralEmail}>
              <Mail className="h-4 w-4 mr-2" />
              {t("referrals.sendInvite")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("referrals.yourReferrals")}</CardTitle>
          <CardDescription>{t("referrals.referralsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("referrals.email")}</TableHead>
                <TableHead>{t("referrals.code")}</TableHead>
                <TableHead>{t("referrals.status")}</TableHead>
                <TableHead>{t("referrals.reward")}</TableHead>
                <TableHead>{t("referrals.date")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell className="font-medium">{referral.referred_email}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{referral.referral_code}</code>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(referral.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(referral.status)}
                        {t(`referrals.status.${referral.status}`)}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${referral.reward_amount} {referral.reward_type}
                  </TableCell>
                  <TableCell>{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => copyReferralLink(referral.referral_code)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {referrals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("referrals.noReferrals")}</p>
              <p className="text-sm">{t("referrals.startInviting")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
