'use client';

import { useState } from 'react';
import { StylingImages } from '@/lib/services/styling-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ImagesTabProps {
  data?: StylingImages;
  onSave: (updates: StylingImages) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  saved?: boolean;
}

export function ImagesTab({ data, onSave, loading, error, saved }: ImagesTabProps) {
  const [formData, setFormData] = useState<StylingImages>(data || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof StylingImages, value: string | null) => {
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

  const imageFields = [
    {
      key: 'logo',
      label: 'Logo',
      description: 'Primary logo (usually dark/colored)',
      placeholder: '/images/logo.svg',
    },
    {
      key: 'logoWhite',
      label: 'White Logo',
      description: 'Logo for dark backgrounds',
      placeholder: '/images/logo-white.svg',
    },
    {
      key: 'favicon',
      label: 'Favicon',
      description: 'Browser tab icon (typically 16x16 or 32x32)',
      placeholder: '/favicon.ico',
    },
    {
      key: 'connectCardBackground',
      label: 'Connect Card Background',
      description: 'Background image for the connect card',
      placeholder: '/images/card-bg.png',
    },
    {
      key: 'bannerOverlay',
      label: 'Banner Overlay',
      description: 'Overlay pattern for banners',
      placeholder: '/images/banner-overlay.png',
    },
    {
      key: 'splashBackground',
      label: 'Splash Screen Background',
      description: 'Large background image for splash/landing page',
      placeholder: '/images/splash-bg.png',
    },
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
        {imageFields.map(({ key, label, description, placeholder }) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-lg">{label}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={key}>Image URL</Label>
                <Input
                  id={key}
                  type="text"
                  placeholder={placeholder}
                  value={formData[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value || null)}
                />
                <p className="text-xs text-slate-500">
                  Enter a relative path (e.g., /images/logo.svg) or absolute URL
                </p>
              </div>

              {/* Preview */}
              {formData[key] && (
                <div className="border rounded-lg p-4 bg-slate-50">
                  <p className="text-sm text-slate-600 mb-2">Preview:</p>
                  <div className="max-w-xs h-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData[key]!}
                      alt={label}
                      className="max-w-full h-auto max-h-40 object-contain"
                      onError={() => {
                        console.error(`Failed to load image: ${formData[key]}`);
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

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
