'use client';

import { useState } from 'react';
import { StylingTextual } from '@/lib/services/styling-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface TextualTabProps {
  data?: StylingTextual;
  onSave: (updates: StylingTextual) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  saved?: boolean;
}

export function TextualTab({ data, onSave, loading, error, saved }: TextualTabProps) {
  const [formData, setFormData] = useState<StylingTextual>(data || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof StylingTextual, value: any) => {
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
        {/* Display Name */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Display Name</CardTitle>
            <CardDescription>The name of your venue or hotspot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name</Label>
              <Input
                id="name"
                placeholder="e.g., Joburg Theatre WiFi"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Welcome Section</CardTitle>
            <CardDescription>Text shown to users on the welcome page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heading">Heading</Label>
              <Input
                id="heading"
                placeholder="e.g., Connect to WiFi"
                value={formData.heading || ''}
                onChange={(e) => handleChange('heading', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subheading">Subheading</Label>
              <Input
                id="subheading"
                placeholder="e.g., Enjoy free high-speed internet"
                value={formData.subheading || ''}
                onChange={(e) => handleChange('subheading', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                placeholder="e.g., Get Connected"
                value={formData.buttonText || ''}
                onChange={(e) => handleChange('buttonText', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Splash Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Splash Screen</CardTitle>
            <CardDescription>Text shown on the splash/landing page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="splashHeading">Splash Heading</Label>
              <Input
                id="splashHeading"
                placeholder="e.g., Welcome to our WiFi"
                value={formData.splashHeading || ''}
                onChange={(e) => handleChange('splashHeading', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Terms & Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Terms & Policies</CardTitle>
            <CardDescription>Links to your terms of service and policies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="termsLinks">Terms Links (JSON)</Label>
              <Textarea
                id="termsLinks"
                placeholder='{"termsOfService": "https://..."}'
                value={formData.termsLinks || ''}
                onChange={(e) => handleChange('termsLinks', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Authentication Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Authentication Methods</CardTitle>
            <CardDescription>Which login methods are available to users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {['free', 'voucher', 'pu-login', 'pu-phonename'].map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <Checkbox
                  id={`auth-${method}`}
                  checked={formData.authMethods?.includes(method) || false}
                  onCheckedChange={(checked) => {
                    const current = formData.authMethods || [];
                    const updated = checked
                      ? [...current, method]
                      : current.filter((m) => m !== method);
                    handleChange('authMethods', updated);
                  }}
                />
                <label
                  htmlFor={`auth-${method}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {method === 'free' && 'Free Access'}
                  {method === 'voucher' && 'Voucher Code'}
                  {method === 'pu-login' && 'Permanent User Login'}
                  {method === 'pu-phonename' && 'Phone Number Login'}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Marketing Opt-In */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Marketing</CardTitle>
            <CardDescription>Email collection preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketing"
                checked={formData.marketingOptIn || false}
                onCheckedChange={(checked) => handleChange('marketingOptIn', checked)}
              />
              <label
                htmlFor="marketing"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Enable marketing email opt-in field
              </label>
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
