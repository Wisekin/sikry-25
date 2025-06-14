import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src//components/ui/card"
import { Button } from "@/src//components/ui/button"
import { Network, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Text } from "@/src//components/core/typography/Text"

export function RelationshipGraph() {
  const { t } = useTranslation('marketIntelPage');
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              {t('relationshipGraph.title')}
            </CardTitle>
            <CardDescription>{t('relationshipGraph.description')}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" title={t('relationshipGraph.buttons.zoomIn')}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" title={t('relationshipGraph.buttons.zoomOut')}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" title={t('relationshipGraph.buttons.reset')}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-8 text-center min-h-96 flex items-center justify-center">
          <div>
            <Network className="w-16 h-16 mx-auto text-secondary mb-4" />
            <Text className="text-secondary">{t('relationshipGraph.placeholder.title')}</Text>
            <Text size="sm" className="text-secondary mt-2">
              {t('relationshipGraph.placeholder.description')}
            </Text>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
