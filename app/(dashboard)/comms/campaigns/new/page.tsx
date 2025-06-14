"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Mail, Linkedin, Phone, PlusCircle, Users } from "lucide-react"
import { useState, useEffect } from "react" // Added useEffect for campaignTypes initialization
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { DatePicker } from "@/src/components/ui/date-picker"

export const metadata = {
  title: "New Campaign | SIKRY",
  description: "Create a new communication campaign",
}

// Define static part of campaign types outside component
const staticCampaignTypes = [
  { value: "email", icon: Mail, labelKey: "newCampaignPage.form.campaignTypes.email" },
  { value: "linkedin", icon: Linkedin, labelKey: "newCampaignPage.form.campaignTypes.linkedin" },
  { value: "phone", icon: Phone, labelKey: "newCampaignPage.form.campaignTypes.phone" },
  { value: "multi-channel", icon: Users, labelKey: "newCampaignPage.form.campaignTypes.multiChannel" },
];

export default function NewCampaignPage() {
  const { t } = useTranslation('commsPage');
  const [campaignTypes, setCampaignTypes] = useState<any[]>([]);

  useEffect(() => {
    setCampaignTypes(
      staticCampaignTypes.map(type => ({
        ...type,
        label: t(type.labelKey)
      }))
    );
  }, [t]);

  const [newType, setNewType] = useState({
    value: "",
    label: "",
    icon: "Mail",
  })

  const handleAddType = () => {
    if (newType.value && newType.label) {
      setCampaignTypes([...campaignTypes, newType])
      setNewType({ value: "", label: "", icon: "Mail" })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('newCampaignPage.header.title')}</h1>
        <p className="text-muted-foreground">{t('newCampaignPage.header.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('newCampaignPage.detailsCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('newCampaignPage.form.nameLabel')}</Label>
                <Input id="name" placeholder={t('newCampaignPage.form.namePlaceholder')} />
              </div>

              <div>
                <Label htmlFor="type">{t('newCampaignPage.form.typeLabel')}</Label>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={t('newCampaignPage.form.typePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {/* Icon rendering logic remains, assuming icons are not translated */}
                            {type.icon === Mail ? (
                              <Mail className="h-4 w-4" />
                            ) : type.icon === Linkedin ? (
                              <Linkedin className="h-4 w-4" />
                            ) : type.icon === Phone ? (
                              <Phone className="h-4 w-4" />
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                            <span>{type.label}</span> {/* Label is now translated via useEffect */}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('newCampaignPage.addTypeDialog.title')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="typeValue">{t('newCampaignPage.addTypeDialog.valueLabel')}</Label>
                          <Input
                            id="typeValue"
                            placeholder={t('newCampaignPage.addTypeDialog.valuePlaceholder')}
                            value={newType.value}
                            onChange={(e) =>
                              setNewType({ ...newType, value: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="typeLabel">{t('newCampaignPage.addTypeDialog.labelLabel')}</Label>
                          <Input
                            id="typeLabel"
                            placeholder={t('newCampaignPage.addTypeDialog.labelPlaceholder')}
                            value={newType.label}
                            onChange={(e) =>
                              setNewType({ ...newType, label: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="typeIcon">{t('newCampaignPage.addTypeDialog.iconLabel')}</Label>
                          <Select
                            value={newType.icon}
                            onValueChange={(value) =>
                              setNewType({ ...newType, icon: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('newCampaignPage.addTypeDialog.iconPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mail">{t('newCampaignPage.addTypeDialog.iconOptions.mail')}</SelectItem>
                              <SelectItem value="Linkedin">{t('newCampaignPage.addTypeDialog.iconOptions.linkedin')}</SelectItem>
                              <SelectItem value="Phone">{t('newCampaignPage.addTypeDialog.iconOptions.phone')}</SelectItem>
                              <SelectItem value="Users">{t('newCampaignPage.addTypeDialog.iconOptions.users')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddType} className="w-full">
                          {t('newCampaignPage.addTypeDialog.addButton')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t('newCampaignPage.form.descriptionLabel')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('newCampaignPage.form.descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('newCampaignPage.form.startDateLabel')}</Label>
                  <DatePicker />
                </div>
                <div>
                  <Label>{t('newCampaignPage.form.endDateLabel')}</Label>
                  <DatePicker />
                </div>
              </div>

              <div>
                <Label htmlFor="targetAudience">{t('newCampaignPage.form.targetAudienceLabel')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t('newCampaignPage.form.targetAudiencePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('newCampaignPage.form.targetAudienceOptions.all')}</SelectItem>
                    <SelectItem value="leads">{t('newCampaignPage.form.targetAudienceOptions.leads')}</SelectItem>
                    <SelectItem value="customers">{t('newCampaignPage.form.targetAudienceOptions.customers')}</SelectItem>
                    <SelectItem value="custom">{t('newCampaignPage.form.targetAudienceOptions.custom')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template">{t('newCampaignPage.form.templateLabel')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t('newCampaignPage.form.templatePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">{t('newCampaignPage.form.templateOptions.welcome')}</SelectItem>
                    <SelectItem value="follow-up">{t('newCampaignPage.form.templateOptions.followUp')}</SelectItem>
                    <SelectItem value="promotion">{t('newCampaignPage.form.templateOptions.promotion')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button">
                {t('newCampaignPage.buttons.saveDraft')}
              </Button>
              <Button type="submit">{t('newCampaignPage.buttons.createCampaign')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 