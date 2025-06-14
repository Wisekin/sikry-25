"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { UserGroupIcon, UserPlusIcon, UserCircleIcon } from "@heroicons/react/24/outline" // These seem unused, but I'll leave them.
import { UserPlus, Users, Mail } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useTranslation } from 'react-i18next';

export default function UsersPage() {
  const { t } = useTranslation(['adminUsersPage', 'common']);
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const viewMode = searchParams.get('view') || 'grid'

  const [searchQuery, setSearchQuery] = useState("")

  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      status: "Active",
      lastActive: "2024-02-20 14:30:00"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "User",
      status: "Active",
      lastActive: "2024-02-20 13:15:00"
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "User",
      status: "Inactive",
      lastActive: "2024-02-19 09:45:00"
    }
  ]

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('overview.stats.totalUsers.title')}</CardTitle>
                  <Users className="w-5 h-5 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">24</div> {/* Mock data */}
                  <p className="text-xs text-gray-500">{t('overview.stats.totalUsers.description')}</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('overview.stats.pendingInvites.title')}</CardTitle>
                  <Mail className="w-5 h-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">3</div> {/* Mock data */}
                  <p className="text-xs text-gray-500">{t('overview.stats.pendingInvites.description')}</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('overview.stats.newUsers.title')}</CardTitle>
                  <UserPlus className="w-5 h-5 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">5</div> {/* Mock data */}
                  <p className="text-xs text-gray-500">{t('overview.stats.newUsers.description')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <CardTitle>{t('overview.mainContent.title')}</CardTitle>
                <CardDescription>{t('overview.mainContent.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add users content here */}
                </div>
              </CardContent>
            </Card>
          </>
        )
      case 'users':
        return (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('usersTab.title')}</CardTitle>
              <CardDescription>{t('usersTab.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <Badge variant={user.status.toLowerCase() === "active" ? "default" : "secondary"}>
                        {t(`usersTab.status.${user.status.toLowerCase()}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        {t('edit', { ns: 'common' })}
                      </Button>
                      <Button variant="outline" size="sm">
                        {t('delete', { ns: 'common' })}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      case 'invites':
        return (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('invitesTab.title')}</CardTitle>
              <CardDescription>{t('invitesTab.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                {/* Add invites list/grid content here */}
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">{t('header.title')}</h1>
            <p className="text-gray-500 mt-1">
              {t('header.subtitle')}
            </p>
          </div>
          <Button size="lg" className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <span>{t('header.inviteUserButton')}</span>
          </Button>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}
