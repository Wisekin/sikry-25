import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Eye, Download, RefreshCw } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

export function ScrapePreview() {
  const previewData = {
    url: "https://example.com",
    status: "success",
    fieldsFound: 12,
    extractedData: [
      { field: "Company Name", value: "Example Corp", confidence: 98 },
      { field: "Email", value: "contact@example.com", confidence: 95 },
      { field: "Phone", value: "+1 234 567 8900", confidence: 88 },
      { field: "Address", value: "123 Main St, City, State", confidence: 92 },
    ],
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Scrape Preview
            </CardTitle>
            <CardDescription>Preview extracted data before running full scrape</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <Text className="font-medium">URL: {previewData.url}</Text>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            {previewData.status}
          </Badge>
        </div>

        <div>
          <Text className="font-medium mb-3">Extracted Data ({previewData.fieldsFound} fields)</Text>
          <div className="space-y-3">
            {previewData.extractedData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Text className="font-medium">{item.field}</Text>
                  <Text size="sm" className="text-secondary">
                    {item.value}
                  </Text>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.confidence}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
