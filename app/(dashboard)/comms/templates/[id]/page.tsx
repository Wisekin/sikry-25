"use client"

import { useTranslation } from 'react-i18next';
import '@/i18n/config.client'
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Mail, Linkedin, Phone, Edit2, Copy, Trash2 } from "lucide-react"

// Mock template data - in a real app, this would come from an API
const templates = {
  "email-welcome": {
    id: "email-welcome",
    name: "Welcome Email",
    type: "email",
    description: "Welcome email for new users",
    content: `Subject: Welcome to SIKRY!

Hi {{firstName}},

Welcome to SIKRY! We're excited to have you on board.

Here's what you can do next:
1. Complete your profile
2. Set up your first campaign
3. Connect your LinkedIn account

If you have any questions, feel free to reach out to our support team.

Best regards,
The SIKRY Team`,
    lastModified: "2024-03-15",
    icon: Mail,
  },
  "linkedin-connection": {
    id: "linkedin-connection",
    name: "LinkedIn Connection Request",
    type: "linkedin",
    description: "Template for LinkedIn connection requests",
    content: `Hi {{firstName}},

I noticed we both work in {{industry}} and I'm impressed by your experience at {{company}}. I'd love to connect and learn more about your work.

Would you be open to connecting?

Best regards,
{{myName}}`,
    lastModified: "2024-03-14",
    icon: Linkedin,
  },
  "phone-call-script": {
    id: "phone-call-script",
    name: "Sales Call Script",
    type: "phone",
    description: "Script for initial sales calls",
    content: `Introduction:
"Hi {{firstName}}, this is {{myName}} from SIKRY. How are you today?"

Discovery Questions:
1. "What challenges are you currently facing with {{painPoint}}?"
2. "How are you currently handling {{process}}?"
3. "What would success look like for you in this area?"

Value Proposition:
"Based on what you've shared, I think our solution could help you by {{benefit}}."

Next Steps:
"Would you be interested in seeing a quick demo of how we could help?"

Closing:
"Great! Let's schedule that for {{suggestedTime}}. Does that work for you?"`,
    lastModified: "2024-03-13",
    icon: Phone,
  },
}

export default function TemplatePage({ params }: { params: { id: string } }) {
  const { t } = useTranslation('commsPage');
  const template = templates[params.id as keyof typeof templates]

  if (!template) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold">{t('templateDetailPage.notFound')}</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
          <p className="text-muted-foreground">{template.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit2 className="mr-2 h-4 w-4" />
            {t('templateDetailPage.buttons.edit')}
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            {t('templateDetailPage.buttons.duplicate')}
          </Button>
          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            {t('templateDetailPage.buttons.delete')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('templateDetailPage.contentCard.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap font-mono text-sm">{template.content}</pre>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('templateDetailPage.detailsCard.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('templateDetailPage.detailsCard.typeLabel')}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <template.icon className="h-4 w-4 text-primary" />
                  <span className="capitalize">{t(`templatesList.types.${template.type}`)}</span>
                </div>
              </div>
              <div>
                <Label>{t('templateDetailPage.detailsCard.lastModifiedLabel')}</Label>
                <p className="mt-1">{template.lastModified}</p>
              </div>
              <div>
                <Label>{t('templateDetailPage.detailsCard.variablesLabel')}</Label>
                <div className="mt-1 space-y-1">
                  {template.content.match(/{{([^}]+)}}/g)?.map((variable) => (
                    <div key={variable} className="text-sm text-muted-foreground">
                      {variable.replace(/[{}]/g, "")}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 