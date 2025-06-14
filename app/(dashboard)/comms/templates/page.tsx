import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { PlusCircle, Mail, Linkedin, Phone } from "lucide-react"
import { PageLoader } from "@/src/components/core/loading/PageLoader"
import { ROUTES } from "@/src/constants/routes"

export const metadata = {
  title: "Templates | SIKRY",
  description: "Manage your communication templates",
}

export default function TemplatesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">Manage your communication templates for different channels.</p>
        </div>
        <Button asChild>
          <Link href={ROUTES.TEMPLATES + "/new"}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      <Suspense fallback={<PageLoader />}>
        <TemplatesList />
      </Suspense>
    </div>
  )
}

function TemplatesList() {
  const templates = [
    {
      id: "email-welcome",
      name: "Welcome Email",
      type: "email",
      description: "Welcome email for new users",
      lastModified: "2024-03-15",
      icon: Mail,
    },
    {
      id: "linkedin-connection",
      name: "LinkedIn Connection Request",
      type: "linkedin",
      description: "Template for LinkedIn connection requests",
      lastModified: "2024-03-14",
      icon: Linkedin,
    },
    {
      id: "phone-call-script",
      name: "Sales Call Script",
      type: "phone",
      description: "Script for initial sales calls",
      lastModified: "2024-03-13",
      icon: Phone,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Link key={template.id} href={`/comms/templates/${template.id}`}>
          <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <template.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="capitalize">{template.type}</span>
                <span>Modified {template.lastModified}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
