import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { useSearchStore } from '@/stores/searchStore'; // Assuming path to your store

export function DisplayPreferences() {
  const { preferences, toggleShowCompanyDescription } = useSearchStore(state => ({
    preferences: state.preferences,
    toggleShowCompanyDescription: state.toggleShowCompanyDescription,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Preferences</CardTitle>
        <CardDescription>
          Customize how information is displayed across the application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label htmlFor="show-description-toggle" className="font-medium">
              Show Company Descriptions
            </Label>
            <p className="text-xs text-muted-foreground">
              Display company descriptions on search result cards.
            </p>
          </div>
          <Switch
            id="show-description-toggle"
            checked={preferences.showCompanyDescription}
            onCheckedChange={toggleShowCompanyDescription}
            aria-label="Toggle company descriptions visibility"
          />
        </div>

        {/* Placeholder for more display preferences */}
        <div className="p-4 border rounded-lg opacity-50">
          <div>
            <Label htmlFor="placeholder-toggle" className="font-medium">
              Another Display Setting (Coming Soon)
            </Label>
            <p className="text-xs text-muted-foreground">
              Future customization option.
            </p>
          </div>
           <Switch
            id="placeholder-toggle"
            disabled
            aria-label="Placeholder toggle for another display setting"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default DisplayPreferences;
