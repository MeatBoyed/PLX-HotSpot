'use client';

import { useState } from 'react';
import { StylingAdvertising } from '@/lib/services/styling-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface AdvertisingTabProps {
  data?: StylingAdvertising;
  onSave: (updates: StylingAdvertising) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  saved?: boolean;
}

export function AdvertisingTab({ data, onSave, loading, error, saved }: AdvertisingTabProps) {
  const [formData, setFormData] = useState<StylingAdvertising>(data || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof StylingAdvertising, value: string | null) => {
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
        {/* Revive Ad Server Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revive Ad Server</CardTitle>
            <CardDescription>Configure display advertising through Revive Ad Server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adsReviveServerUrl">Revive Server URL</Label>
              <Input
                id="adsReviveServerUrl"
                type="url"
                placeholder="https://servedby.revive-adserver.net/asyncjs.php"
                value={formData.adsReviveServerUrl || ''}
                onChange={(e) => handleChange('adsReviveServerUrl', e.target.value || null)}
              />
              <p className="text-xs text-slate-500">The URL to your Revive Ad Server async script endpoint</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adsReviveId">Revive Publisher ID</Label>
              <Input
                id="adsReviveId"
                placeholder="e.g., 727bec5e09208690b050ccfc6a45d384"
                value={formData.adsReviveId || ''}
                onChange={(e) => handleChange('adsReviveId', e.target.value || null)}
              />
              <p className="text-xs text-slate-500">Your publisher/account ID from Revive</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adsZoneId">Zone ID</Label>
              <Input
                id="adsZoneId"
                placeholder="e.g., 20641"
                value={formData.adsZoneId || ''}
                onChange={(e) => handleChange('adsZoneId', e.target.value || null)}
              />
              <p className="text-xs text-slate-500">The specific ad zone/placement ID from Revive</p>
            </div>
          </CardContent>
        </Card>

        {/* VAST Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Video Advertising (VAST)</CardTitle>
            <CardDescription>Configure video ads using VAST protocol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adsVastUrl">VAST URL</Label>
              <Textarea
                id="adsVastUrl"
                placeholder="https://example.com/vast.xml"
                value={formData.adsVastUrl || ''}
                onChange={(e) => handleChange('adsVastUrl', e.target.value || null)}
                rows={3}
              />
              <p className="text-xs text-slate-500">
                The URL to your VAST (Video Ad Serving Template) endpoint or feed. This is used for video advertising.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">About Ad Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>Revive Ad Server</strong> is used for static display advertising. It serves banner ads to your users.
            </p>
            <p>
              <strong>VAST</strong> is used for video advertising. It's a standard protocol for serving video ads to web and mobile apps.
            </p>
            <p>You can configure either or both advertising systems depending on your needs.</p>
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
