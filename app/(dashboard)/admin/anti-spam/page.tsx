"use client"

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Heading } from '@/src/components/core/typography/Heading';
import { Text } from '@/src/components/core/typography/Text';

export default function AntiSpamPage() {
  const { t } = useTranslation('adminAntiSpamPage');

  const spamMetrics = [
    { label: t('spamMetrics.detectionRate'), value: "99.8%", status: "excellent" },
    { label: t('spamMetrics.falsePositives'), value: "0.02%", status: "excellent" },
    { label: t('spamMetrics.blockedMessages'), value: "1,247", status: "normal" },
    { label: t('spamMetrics.quarantined'), value: "23", status: "normal" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-emerald-600";
      case "good": return "text-blue-600";
      case "warning": return "text-yellow-600";
      case "error": return "text-red-600";
      default: return "text-secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Heading level={1}>{t('header.title')}</Heading>
        <Text className="text-secondary">{t('header.description')}</Text>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            {t('status.title')}
          </CardTitle>
          <CardDescription>{t('status.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {spamMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`text-h2 font-semibold ${getStatusColor(metric.status)}`}>{metric.value}</div>
                <Text size="sm" className="text-secondary">{metric.label}</Text>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{t('filterConfig.title')}</CardTitle>
          <CardDescription>{t('filterConfig.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="spam-detection">{t('filterConfig.enableSpamDetection.label')}</Label>
              <Text size="sm" className="text-secondary">{t('filterConfig.enableSpamDetection.description')}</Text>
            </div>
            <Switch id="spam-detection" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-quarantine">{t('filterConfig.autoQuarantine.label')}</Label>
              <Text size="sm" className="text-secondary">{t('filterConfig.autoQuarantine.description')}</Text>
            </div>
            <Switch id="auto-quarantine" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sender-reputation">{t('filterConfig.senderReputation.label')}</Label>
              <Text size="sm" className="text-secondary">{t('filterConfig.senderReputation.description')}</Text>
            </div>
            <Switch id="sender-reputation" defaultChecked />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spam-threshold">{t('filterConfig.spamThreshold.label')}</Label>
            <Input id="spam-threshold" type="number" defaultValue="7.5" min="1" max="10" step="0.1" />
            <Text size="sm" className="text-secondary">{t('filterConfig.spamThreshold.description')}</Text>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              {t('whitelist.title')}
            </CardTitle>
            <CardDescription>{t('whitelist.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder={t('whitelist.placeholder')} rows={6} />
            <Button variant="outline" className="w-full">{t('whitelist.updateButton')}</Button>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              {t('blacklist.title')}
            </CardTitle>
            <CardDescription>{t('blacklist.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder={t('blacklist.placeholder')} rows={6} />
            <Button variant="outline" className="w-full">{t('blacklist.updateButton')}</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{t('compliance.title')}</CardTitle>
          <CardDescription>{t('compliance.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gdpr-compliance">{t('compliance.gdpr.label')}</Label>
              <Text size="sm" className="text-secondary">{t('compliance.gdpr.description')}</Text>
            </div>
            <Switch id="gdpr-compliance" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="can-spam">{t('compliance.canSpam.label')}</Label>
              <Text size="sm" className="text-secondary">{t('compliance.canSpam.description')}</Text>
            </div>
            <Switch id="can-spam" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="unsubscribe-links">{t('compliance.unsubscribe.label')}</Label>
              <Text size="sm" className="text-secondary">{t('compliance.unsubscribe.description')}</Text>
            </div>
            <Switch id="unsubscribe-links" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
