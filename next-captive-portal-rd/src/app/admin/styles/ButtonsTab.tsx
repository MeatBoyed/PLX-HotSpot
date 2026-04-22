'use client';

import { useState } from 'react';
import { StylingButtons } from '@/lib/services/styling-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ButtonsTabProps {
  data?: StylingButtons;
  onSave: (updates: StylingButtons) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  saved?: boolean;
}

export function ButtonsTab({ data, onSave, loading, error, saved }: ButtonsTabProps) {
  const [formData, setFormData] = useState<StylingButtons>(data || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof StylingButtons, value: string) => {
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

  const primaryButtonFields = [
    { key: 'buttonPrimary', label: 'Primary Button Background', description: 'Main action button color' },
    { key: 'buttonPrimaryHover', label: 'Primary Button Hover', description: 'Hover state color' },
    { key: 'buttonPrimaryText', label: 'Primary Button Text', description: 'Text color for primary buttons' },
  ] as const;

  const secondaryButtonFields = [
    { key: 'buttonSecondary', label: 'Secondary Button Background', description: 'Secondary action button color' },
    { key: 'buttonSecondaryHover', label: 'Secondary Button Hover', description: 'Hover state color' },
    { key: 'buttonSecondaryText', label: 'Secondary Button Text', description: 'Text color for secondary buttons' },
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
        {/* Primary Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Primary Buttons</CardTitle>
            <CardDescription>Main call-to-action buttons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {primaryButtonFields.map(({ key, label, description }) => (
                <div key={key} className="space-y-2">
                  <div>
                    <Label htmlFor={key}>{label}</Label>
                    <p className="text-xs text-slate-500 mt-1">{description}</p>
                  </div>
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

        {/* Secondary Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Secondary Buttons</CardTitle>
            <CardDescription>Alternative and cancel action buttons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {secondaryButtonFields.map(({ key, label, description }) => (
                <div key={key} className="space-y-2">
                  <div>
                    <Label htmlFor={key}>{label}</Label>
                    <p className="text-xs text-slate-500 mt-1">{description}</p>
                  </div>
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

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
            <CardDescription>See how your buttons will look</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <button
                style={{
                  backgroundColor: formData.buttonPrimary || '#000',
                  color: formData.buttonPrimaryText || '#fff',
                }}
                className="px-6 py-2 rounded font-medium"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    formData.buttonPrimaryHover || formData.buttonPrimary || '#333';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    formData.buttonPrimary || '#000';
                }}
              >
                Primary Button
              </button>
              <button
                style={{
                  backgroundColor: formData.buttonSecondary || '#fff',
                  color: formData.buttonSecondaryText || '#000',
                  border: `2px solid ${formData.buttonSecondary || '#000'}`,
                }}
                className="px-6 py-2 rounded font-medium"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    formData.buttonSecondaryHover || formData.buttonSecondary || '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    formData.buttonSecondary || '#fff';
                }}
              >
                Secondary Button
              </button>
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
