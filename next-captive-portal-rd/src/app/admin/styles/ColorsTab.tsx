'use client';

import { useState } from 'react';
import { StylingColors } from '@/lib/services/styling-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ColorsTabProps {
  data?: StylingColors;
  onSave: (updates: StylingColors) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  saved?: boolean;
}

export function ColorsTab({ data, onSave, loading, error, saved }: ColorsTabProps) {
  const [formData, setFormData] = useState<StylingColors>(data || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof StylingColors, value: string) => {
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

  const brandColorFields = [
    { key: 'brandPrimary', label: 'Primary Color' },
    { key: 'brandPrimaryHover', label: 'Primary Hover' },
    { key: 'brandSecondary', label: 'Secondary Color' },
    { key: 'brandAccent', label: 'Accent Color' },
  ] as const;

  const textColorFields = [
    { key: 'textPrimary', label: 'Primary Text' },
    { key: 'textSecondary', label: 'Secondary Text' },
    { key: 'textTertiary', label: 'Tertiary Text' },
    { key: 'textMuted', label: 'Muted Text' },
  ] as const;

  const surfaceColorFields = [
    { key: 'surfaceCard', label: 'Card Surface' },
    { key: 'surfaceWhite', label: 'White Surface' },
    { key: 'surfaceBorder', label: 'Border Color' },
  ] as const;

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
        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Brand Colors</CardTitle>
            <CardDescription>Primary branding colors used throughout the interface</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brandColorFields.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type="color"
                      value={formData[key] || '#000000'}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="h-10 w-16 cursor-pointer"
                    />
                    <Input
                      type="text"
                      placeholder="#000000"
                      value={formData[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Text Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Text Colors</CardTitle>
            <CardDescription>Colors for different text hierarchy levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {textColorFields.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type="color"
                      value={formData[key] || '#000000'}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="h-10 w-16 cursor-pointer"
                    />
                    <Input
                      type="text"
                      placeholder="#000000"
                      value={formData[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Surface Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Surface Colors</CardTitle>
            <CardDescription>Background and border colors for surfaces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {surfaceColorFields.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type="color"
                      value={formData[key] || '#000000'}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="h-10 w-16 cursor-pointer"
                    />
                    <Input
                      type="text"
                      placeholder="#000000"
                      value={formData[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
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
