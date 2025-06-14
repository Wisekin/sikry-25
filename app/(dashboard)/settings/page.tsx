"use client"

import { AppShell } from "@/src/components/core/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useTranslation } from 'react-i18next';
import { SmartInsights } from "@/src/components/insights/SmartInsights"
import { UserIcon, BellIcon, ShieldCheckIcon, CreditCardIcon, GlobeAltIcon, KeyIcon, ChevronRightIcon } from "@heroicons/react/24/solid"

export default function SettingsPage() {
  const { t } = useTranslation(['settingsPage', 'common']);
  const notificationsCount = 12; // Example count
  const securityScore = 95; // Example score

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('header.title', { ns: 'settingsPage' })}</h1>
        <p className="text-gray-500 mt-2">{t('header.subtitle', { ns: 'settingsPage' })}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#1B1F3B]" />
              {t('overviewCards.profile.title', { ns: 'settingsPage' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-[#1B1F3B]">{t('overviewCards.profile.value', { ns: 'settingsPage' })}</div>
            <p className="text-sm text-gray-500 mt-1">{t('overviewCards.profile.description', { ns: 'settingsPage' })}</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-[#1B1F3B]" />
              {t('overviewCards.security.title', { ns: 'settingsPage' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-[#1B1F3B]">{t('percentageFormat', { ns: 'common', value: securityScore })}</div>
            <p className="text-sm text-gray-500 mt-1">{t('overviewCards.security.description', { ns: 'settingsPage' })}</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <BellIcon className="w-4 h-4 text-[#1B1F3B]" />
              {t('overviewCards.notifications.title', { ns: 'settingsPage' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-[#1B1F3B]">{t('overviewCards.notifications.valueActive', { ns: 'settingsPage', count: notificationsCount })}</div>
            <p className="text-sm text-gray-500 mt-1">{t('overviewCards.notifications.description', { ns: 'settingsPage' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights Banner */}
      <div className="bg-gradient-to-r from-[#1B1F3B] to-[#2D325E] rounded-xl p-5 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{t('insightsBanner.title', { ns: 'settingsPage' })}</h3>
            <p className="text-sm opacity-80 mt-1">{t('insightsBanner.description', { ns: 'settingsPage' })}</p>
          </div>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            {t('insightsBanner.buttonText', { ns: 'settingsPage' })} <ChevronRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Modern Tabs */}
      <Tabs defaultValue="profile" className="w-full mt-6">
        <TabsList className="bg-transparent border-b border-gray-200 rounded-none p-0 gap-6">
          <TabsTrigger value="profile" className="px-0 py-4 data-[state=active]:border-b-2 data-[state=active]:border-[#1B1F3B] data-[state=active]:text-[#1B1F3B] rounded-none">
            <UserIcon className="w-4 h-4 mr-2" />
            {t('tabs.profile', { ns: 'settingsPage' })}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="px-0 py-4 data-[state=active]:border-b-2 data-[state=active]:border-[#1B1F3B] data-[state=active]:text-[#1B1F3B] rounded-none">
            <BellIcon className="w-4 h-4 mr-2" />
            {t('tabs.notifications', { ns: 'settingsPage' })}
          </TabsTrigger>
          <TabsTrigger value="security" className="px-0 py-4 data-[state=active]:border-b-2 data-[state=active]:border-[#1B1F3B] data-[state=active]:text-[#1B1F3B] rounded-none">
            <ShieldCheckIcon className="w-4 h-4 mr-2" />
            {t('tabs.security', { ns: 'settingsPage' })}
          </TabsTrigger>
          <TabsTrigger value="billing" className="px-0 py-4 data-[state=active]:border-b-2 data-[state=active]:border-[#1B1F3B] data-[state=active]:text-[#1B1F3B] rounded-none">
            <CreditCardIcon className="w-4 h-4 mr-2" />
            {t('tabs.billing', { ns: 'settingsPage' })}
          </TabsTrigger>
          <TabsTrigger value="integrations" className="px-0 py-4 data-[state=active]:border-b-2 data-[state=active]:border-[#1B1F3B] data-[state=active]:text-[#1B1F3B] rounded-none">
            <GlobeAltIcon className="w-4 h-4 mr-2" />
            {t('tabs.integrations', { ns: 'settingsPage' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t('profileTab.companyInfo.title', { ns: 'settingsPage' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="company" className="text-gray-700">{t('profileTab.companyInfo.companyNameLabel', { ns: 'settingsPage' })}</Label>
                  <Input id="company" defaultValue="SIKRY Intelligence" className="mt-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-700">{t('profileTab.companyInfo.firstNameLabel', { ns: 'settingsPage' })}</Label>
                    <Input id="firstName" defaultValue="John" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-700">{t('profileTab.companyInfo.lastNameLabel', { ns: 'settingsPage' })}</Label>
                    <Input id="lastName" defaultValue="Doe" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700">{t('profileTab.companyInfo.emailLabel', { ns: 'settingsPage' })}</Label>
                  <Input id="email" type="email" defaultValue="john.doe@sikry.com" className="mt-1" />
                </div>
                <div className="pt-4">
                  <Button className="bg-[#1B1F3B] hover:bg-[#2D325E]">{t('profileTab.companyInfo.saveButton', { ns: 'settingsPage' })}</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t('profileTab.preferences.title', { ns: 'settingsPage' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="timezone" className="text-gray-700">{t('profileTab.preferences.timezoneLabel', { ns: 'settingsPage' })}</Label>
                  <Select defaultValue="europe/zurich">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="europe/zurich">Europe/Zurich</SelectItem>
                      <SelectItem value="europe/london">Europe/London</SelectItem>
                      <SelectItem value="america/new_york">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language" className="text-gray-700">{t('profileTab.preferences.languageLabel', { ns: 'settingsPage' })}</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('profileTab.preferences.languageOptions.en', { ns: 'settingsPage' })}</SelectItem>
                      <SelectItem value="fr">{t('profileTab.preferences.languageOptions.fr', { ns: 'settingsPage' })}</SelectItem>
                      <SelectItem value="de">{t('profileTab.preferences.languageOptions.de', { ns: 'settingsPage' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <Label htmlFor="darkMode" className="text-gray-700">{t('profileTab.preferences.darkModeLabel', { ns: 'settingsPage' })}</Label>
                    <p className="text-sm text-gray-500">{t('profileTab.preferences.darkModeDescription', { ns: 'settingsPage' })}</p>
                  </div>
                  <Switch id="darkMode" />
                </div>
                <div className="pt-4">
                  <Button className="bg-[#1B1F3B] hover:bg-[#2D325E]">{t('profileTab.preferences.saveButton', { ns: 'settingsPage' })}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="pt-8">
          <Card className="border-0 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-lg">{t('notificationsTab.title', { ns: 'settingsPage' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="emailNotifs" className="text-gray-700">{t('notificationsTab.email.label', { ns: 'settingsPage' })}</Label>
                    <p className="text-sm text-gray-500">{t('notificationsTab.email.description', { ns: 'settingsPage' })}</p>
                  </div>
                  <Switch id="emailNotifs" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="scraperAlerts" className="text-gray-700">{t('notificationsTab.scraperAlerts.label', { ns: 'settingsPage' })}</Label>
                    <p className="text-sm text-gray-500">{t('notificationsTab.scraperAlerts.description', { ns: 'settingsPage' })}</p>
                  </div>
                  <Switch id="scraperAlerts" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="weeklyReports" className="text-gray-700">{t('notificationsTab.weeklyReports.label', { ns: 'settingsPage' })}</Label>
                    <p className="text-sm text-gray-500">{t('notificationsTab.weeklyReports.description', { ns: 'settingsPage' })}</p>
                  </div>
                  <Switch id="weeklyReports" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="marketingEmails" className="text-gray-700">{t('notificationsTab.marketingEmails.label', { ns: 'settingsPage' })}</Label>
                    <p className="text-sm text-gray-500">{t('notificationsTab.marketingEmails.description', { ns: 'settingsPage' })}</p>
                  </div>
                  <Switch id="marketingEmails" />
                </div>
              </div>
              <div className="pt-4">
                <Button className="bg-[#1B1F3B] hover:bg-[#2D325E]">{t('notificationsTab.saveButton', { ns: 'settingsPage' })}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <KeyIcon className="w-5 h-5" />
                  {t('securityTab.auth.title', { ns: 'settingsPage' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="currentPassword" className="text-gray-700">{t('securityTab.auth.currentPasswordLabel', { ns: 'settingsPage' })}</Label>
                  <Input id="currentPassword" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-gray-700">{t('securityTab.auth.newPasswordLabel', { ns: 'settingsPage' })}</Label>
                  <Input id="newPassword" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-700">{t('securityTab.auth.confirmPasswordLabel', { ns: 'settingsPage' })}</Label>
                  <Input id="confirmPassword" type="password" className="mt-1" />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <Label htmlFor="twoFactor" className="text-gray-700">{t('securityTab.auth.twoFactorLabel', { ns: 'settingsPage' })}</Label>
                    <p className="text-sm text-gray-500">{t('securityTab.auth.twoFactorDescription', { ns: 'settingsPage' })}</p>
                  </div>
                  <Switch id="twoFactor" />
                </div>
                <div className="pt-4">
                  <Button className="bg-[#1B1F3B] hover:bg-[#2D325E]">{t('securityTab.auth.updateButton', { ns: 'settingsPage' })}</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t('securityTab.apiAccess.title', { ns: 'settingsPage' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="text-gray-700">{t('securityTab.apiAccess.productionKeyLabel', { ns: 'settingsPage' })}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value="sk-prod-**********************" readOnly className="bg-gray-50" />
                    <Button variant="outline">{t('copy', { ns: 'common' })}</Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{t('securityTab.apiAccess.productionKeyDescription', { ns: 'settingsPage' })}</p>
                </div>
                <div>
                  <Label className="text-gray-700">{t('securityTab.apiAccess.developmentKeyLabel', { ns: 'settingsPage' })}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value="sk-dev-**********************" readOnly className="bg-gray-50" />
                    <Button variant="outline">{t('copy', { ns: 'common' })}</Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{t('securityTab.apiAccess.developmentKeyDescription', { ns: 'settingsPage' })}</p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="border-[#1B1F3B] text-[#1B1F3B] hover:bg-[#1B1F3B]/10">
                    {t('securityTab.apiAccess.generateNewKeyButton', { ns: 'settingsPage' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t('billingTab.subscription.title', { ns: 'settingsPage' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="p-5 bg-gradient-to-r from-[#1B1F3B]/5 to-[#2D325E]/5 rounded-lg border border-[#1B1F3B]/10">
                  <h3 className="text-xl font-bold text-[#1B1F3B]">{t('billingTab.subscription.planNameProfessional', { ns: 'settingsPage' })}</h3>
                  <p className="text-3xl font-bold mt-1">
                    $99<span className="text-lg text-gray-500">{t('billingTab.subscription.priceSuffixPerMonth', { ns: 'settingsPage' })}</span>
                  </p>
                  <p className="text-gray-600 mt-3">{t('billingTab.subscription.profilesLimitText', { ns: 'settingsPage', count: 10000 })}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-600">{t('billingTab.subscription.nextBillingDateLabel', { ns: 'settingsPage' })}</span>
                    <span className="font-medium">Feb 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('billingTab.subscription.usageThisMonthLabel', { ns: 'settingsPage' })}</span>
                    <span className="font-medium">7,234 / 10,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-[#1B1F3B] h-2 rounded-full" style={{width: '72%'}}></div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="bg-[#1B1F3B] hover:bg-[#2D325E] w-full">{t('billingTab.subscription.upgradeButton', { ns: 'settingsPage' })}</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t('billingTab.paymentMethod.title', { ns: 'settingsPage' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-7 bg-gradient-to-r from-[#1B1F3B] to-[#2D325E] rounded text-white text-xs flex items-center justify-center font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">**** **** **** 4242</p>
                    <p className="text-sm text-gray-500">{t('billingTab.paymentMethod.expiresLabel', { ns: 'settingsPage', date: "12/25" })}</p>
                  </div>
                </div>
                <div>
                  <Button variant="outline" className="w-full border-[#1B1F3B] text-[#1B1F3B] hover:bg-[#1B1F3B]/10">
                    {t('billingTab.paymentMethod.updateButton', { ns: 'settingsPage' })}
                  </Button>
                </div>
                <div>
                  <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                    {t('billingTab.paymentMethod.downloadInvoicesButton', { ns: 'settingsPage' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t('integrationsTab.connectedServices.title', { ns: 'settingsPage' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">LI</span>
                    </div>
                    <div>
                      <p className="font-medium">{t('integrationsTab.connectedServices.linkedIn', { ns: 'settingsPage' })}</p>
                      <p className="text-sm text-gray-500">{t('status.connected', { ns: 'common' })}</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">SF</span>
                    </div>
                    <div>
                      <p className="font-medium">{t('integrationsTab.connectedServices.salesforce', { ns: 'settingsPage' })}</p>
                      <p className="text-sm text-gray-500">{t('status.notConnected', { ns: 'common' })}</p>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">HS</span>
                    </div>
                    <div>
                      <p className="font-medium">{t('integrationsTab.connectedServices.hubspot', { ns: 'settingsPage' })}</p>
                      <p className="text-sm text-gray-500">{t('status.connected', { ns: 'common' })}</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t('integrationsTab.webhook.title', { ns: 'settingsPage' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="webhookUrl" className="text-gray-700">{t('integrationsTab.webhook.endpointUrlLabel', { ns: 'settingsPage' })}</Label>
                  <Input 
                    id="webhookUrl" 
                    placeholder="https://your-app.com/webhook" 
                    className="mt-1 font-mono text-sm"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">{t('integrationsTab.webhook.eventsToSendLabel', { ns: 'settingsPage' })}</Label>
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center space-x-3">
                      <Switch id="companyFound" defaultChecked />
                      <Label htmlFor="companyFound">{t('integrationsTab.webhook.eventCompanyFound', { ns: 'settingsPage' })}</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch id="scraperComplete" defaultChecked />
                      <Label htmlFor="scraperComplete">{t('integrationsTab.webhook.eventScraperCompleted', { ns: 'settingsPage' })}</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch id="campaignSent" />
                      <Label htmlFor="campaignSent">{t('integrationsTab.webhook.eventCampaignSent', { ns: 'settingsPage' })}</Label>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="bg-[#1B1F3B] hover:bg-[#2D325E] w-full">{t('integrationsTab.webhook.saveButton', { ns: 'settingsPage' })}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}