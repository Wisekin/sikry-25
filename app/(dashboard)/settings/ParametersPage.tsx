"use client"

import { useState } from "react"
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"
import { Text } from "@/src/components/core/typography/Text"
import { Save } from "lucide-react"

export function ParametersPage() {
  const { t } = useTranslation(['settingsPage', 'common']);
  const [settings, setSettings] = useState({
    dataRetention: "30",
    autoRefresh: true,
    defaultView: "list",
    exportFormat: "csv",
    apiLimit: "1000",
    enableNotifications: true,
    darkMode: false,
    language: "en",
  })

  const handleChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('parametersPage.general.title', { ns: 'settingsPage' })}</CardTitle>
          <CardDescription>{t('parametersPage.general.description', { ns: 'settingsPage' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultView">{t('parametersPage.general.defaultView.label', { ns: 'settingsPage' })}</Label>
              <Select value={settings.defaultView} onValueChange={(value) => handleChange("defaultView", value)}>
                <SelectTrigger id="defaultView">
                  <SelectValue placeholder={t('parametersPage.general.defaultView.placeholder', { ns: 'settingsPage' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">{t('parametersPage.general.defaultView.options.list', { ns: 'settingsPage' })}</SelectItem>
                  <SelectItem value="grid">{t('parametersPage.general.defaultView.options.grid', { ns: 'settingsPage' })}</SelectItem>
                  <SelectItem value="map">{t('parametersPage.general.defaultView.options.map', { ns: 'settingsPage' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t('parametersPage.general.language.label', { ns: 'settingsPage' })}</Label>
              <Select value={settings.language} onValueChange={(value) => handleChange("language", value)}>
                <SelectTrigger id="language">
                  <SelectValue placeholder={t('parametersPage.general.language.placeholder', { ns: 'settingsPage' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('parametersPage.general.language.options.en', { ns: 'settingsPage' })}</SelectItem>
                  <SelectItem value="fr">{t('parametersPage.general.language.options.fr', { ns: 'settingsPage' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exportFormat">{t('parametersPage.general.exportFormat.label', { ns: 'settingsPage' })}</Label>
              <Select value={settings.exportFormat} onValueChange={(value) => handleChange("exportFormat", value)}>
                <SelectTrigger id="exportFormat">
                  <SelectValue placeholder={t('parametersPage.general.exportFormat.placeholder', { ns: 'settingsPage' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">{t('parametersPage.general.exportFormat.options.csv', { ns: 'settingsPage' })}</SelectItem>
                  <SelectItem value="xlsx">{t('parametersPage.general.exportFormat.options.xlsx', { ns: 'settingsPage' })}</SelectItem>
                  <SelectItem value="json">{t('parametersPage.general.exportFormat.options.json', { ns: 'settingsPage' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataRetention">{t('parametersPage.general.dataRetention.label', { ns: 'settingsPage' })}</Label>
              <Input
                id="dataRetention"
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleChange("dataRetention", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoRefresh">{t('parametersPage.general.autoRefresh.label', { ns: 'settingsPage' })}</Label>
              <Text size="sm" className="text-secondary">
                {t('parametersPage.general.autoRefresh.description', { ns: 'settingsPage' })}
              </Text>
            </div>
            <Switch
              id="autoRefresh"
              checked={settings.autoRefresh}
              onCheckedChange={(checked) => handleChange("autoRefresh", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableNotifications">{t('parametersPage.general.enableNotifications.label', { ns: 'settingsPage' })}</Label>
              <Text size="sm" className="text-secondary">
                {t('parametersPage.general.enableNotifications.description', { ns: 'settingsPage' })}
              </Text>
            </div>
            <Switch
              id="enableNotifications"
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => handleChange("enableNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkMode">{t('parametersPage.general.darkMode.label', { ns: 'settingsPage' })}</Label>
              <Text size="sm" className="text-secondary">
                {t('parametersPage.general.darkMode.description', { ns: 'settingsPage' })}
              </Text>
            </div>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleChange("darkMode", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('parametersPage.api.title', { ns: 'settingsPage' })}</CardTitle>
          <CardDescription>{t('parametersPage.api.description', { ns: 'settingsPage' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="apiLimit">{t('parametersPage.api.requestLimit.label', { ns: 'settingsPage' })}</Label>
            <Input
              id="apiLimit"
              type="number"
              value={settings.apiLimit}
              onChange={(e) => handleChange("apiLimit", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          {t('parametersPage.buttons.save', { ns: 'settingsPage' })}
        </Button>
      </div>
    </div>
  )
}
