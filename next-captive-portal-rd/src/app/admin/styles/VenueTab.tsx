'use client';

import { useState } from 'react';
import { StylingVenue } from '@/lib/services/styling-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface VenueTabProps {
  data?: StylingVenue;
  onSave: (updates: StylingVenue) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  saved?: boolean;
}

export function VenueTab({ data, onSave, loading, error, saved }: VenueTabProps) {
  const [formData, setFormData] = useState<StylingVenue>(data || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof StylingVenue, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saved && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Changes saved successfully!</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Venue Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Venue Information</CardTitle>
            <CardDescription>Details about this venue location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venueLabel">Venue Label (Display Name)</Label>
              <Input
                id="venueLabel"
                placeholder="e.g., Soweto Theatre"
                value={formData.venueLabel || ''}
                onChange={(e) => handleChange('venueLabel', e.target.value || null)}
              />
              <p className="text-xs text-slate-500">The friendly name shown in dropdowns</p>
            </div>
          </CardContent>
        </Card>

        {/* Sub-Venue Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sub-Venue Configuration</CardTitle>
            <CardDescription>Settings for venues that are sub-locations of a parent venue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parentSsid">Parent SSID</Label>
              <Input
                id="parentSsid"
                placeholder="e.g., joburg-theatre"
                value={formData.parentSsid || ''}
                onChange={(e) => handleChange('parentSsid', e.target.value || null)}
              />
              <p className="text-xs text-slate-500">
                The SSID of the parent venue. Leave empty if this is not a sub-venue.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venueRoute">Venue Route</Label>
              <Input
                id="venueRoute"
                placeholder="e.g., /soweto-theatre"
                value={formData.venueRoute || ''}
                onChange={(e) => handleChange('venueRoute', e.target.value || null)}
              />
              <p className="text-xs text-slate-500">URL path for this sub-venue (e.g., used in navigation)</p>
            </div>
          </CardContent>
        </Card>

        {/* Display Order */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Display Order</CardTitle>
            <CardDescription>Control the sort order in dropdowns and lists</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                placeholder="0"
                value={formData.sortOrder ?? ''}
                onChange={(e) =>
                  handleChange('sortOrder', e.target.value ? parseInt(e.target.value, 10) : null)
                }
              />
              <p className="text-xs text-slate-500">
                Lower numbers appear first in lists. Leave empty for default sorting.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving || loading}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
