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
import { Mail, Linkedin, Phone, PlusCircle } from "lucide-react"
import { useState, useEffect } from "react" // Added useEffect
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"


// Define static part of template types outside component
const staticTemplateTypes = [
  { value: "email", icon: Mail, labelKey: "newTemplatePage.form.templateTypes.email" },
  { value: "linkedin", icon: Linkedin, labelKey: "newTemplatePage.form.templateTypes.linkedin" },
  { value: "phone", icon: Phone, labelKey: "newTemplatePage.form.templateTypes.phone" }
];

export default function NewTemplatePage() {
  const { t } = useTranslation(['commsPage', 'common']);
  const [templateTypes, setTemplateTypes] = useState<any[]>([]);

  useEffect(() => {
    setTemplateTypes(
      staticTemplateTypes.map(type => ({
        ...type,
        label: t(type.labelKey)
      }))
    );
  }, [t]);

  const [newType, setNewType] = useState({
    value: "",
    label: "",
    icon: "Mail", // Default icon
  })

  const handleAddType = () => {
    if (newType.value && newType.label) {
      setTemplateTypes([...templateTypes, newType])
      setNewType({ value: "", label: "", icon: "Mail" })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('newTemplatePage.header.title')}</h1>
        <p className="text-muted-foreground">{t('newTemplatePage.header.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('newTemplatePage.detailsCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('newTemplatePage.form.nameLabel')}</Label>
                <Input id="name" placeholder={t('newTemplatePage.form.namePlaceholder')} />
              </div>

              <div>
                <Label htmlFor="type">{t('newTemplatePage.form.typeLabel')}</Label>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={t('newTemplatePage.form.typePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {/* Icon rendering logic remains */}
                            {type.icon === Mail ? (
                              <Mail className="h-4 w-4" />
                            ) : type.icon === Linkedin ? (
                              <Linkedin className="h-4 w-4" />
                            ) : (
                              <Phone className="h-4 w-4" />
                            )}
                            <span>{type.label}</span> {/* Label is now translated */}
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
                        <DialogTitle>{t('newTemplatePage.addTypeDialog.title')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="typeValue">{t('newTemplatePage.addTypeDialog.valueLabel')}</Label>
                          <Input
                            id="typeValue"
                            placeholder={t('newTemplatePage.addTypeDialog.valuePlaceholder')}
                            value={newType.value}
                            onChange={(e) =>
                              setNewType({ ...newType, value: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="typeLabel">{t('newTemplatePage.addTypeDialog.labelLabel')}</Label>
                          <Input
                            id="typeLabel"
                            placeholder={t('newTemplatePage.addTypeDialog.labelPlaceholder')}
                            value={newType.label}
                            onChange={(e) =>
                              setNewType({ ...newType, label: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="typeIcon">{t('newTemplatePage.addTypeDialog.iconLabel')}</Label>
                          <Select
                            value={newType.icon}
                            onValueChange={(value) =>
                              setNewType({ ...newType, icon: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('newTemplatePage.addTypeDialog.iconPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mail">{t('newTemplatePage.addTypeDialog.iconOptions.mail')}</SelectItem>
                              <SelectItem value="Linkedin">{t('newTemplatePage.addTypeDialog.iconOptions.linkedin')}</SelectItem>
                              <SelectItem value="Phone">{t('newTemplatePage.addTypeDialog.iconOptions.phone')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddType} className="w-full">
                          {t('newTemplatePage.addTypeDialog.addButton')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t('newTemplatePage.form.descriptionLabel')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('newTemplatePage.form.descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">{t('newTemplatePage.form.contentLabel')}</Label>
                <Textarea
                  id="content"
                  placeholder={t('newTemplatePage.form.contentPlaceholder')}
                  rows={10}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button">
                {t('actions.cancel', { ns: 'common' })} {/* Assuming cancel is in common.json under 'actions' */}
              </Button>
              <Button type="submit">{t('newTemplatePage.buttons.createTemplate')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 