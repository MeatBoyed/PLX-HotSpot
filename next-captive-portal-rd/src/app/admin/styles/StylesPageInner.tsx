'use client';

import { useEffect, useState } from 'react';
import { useStylingConfig } from './useStylingConfig';
import { TextualTab } from './TextualTab';
import { ColorsTab } from './ColorsTab';
import { ButtonsTab } from './ButtonsTab';
import { ImagesTab } from './ImagesTab';
import { VenueTab } from './VenueTab';
import { AdvertisingTab } from './AdvertisingTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface StylesPageInnerProps {
  ssid: string;
}

export function StylesPageInner({ ssid }: StylesPageInnerProps) {
  const { config, loading, error, saved, fetchConfig, updateSection } = useStylingConfig(ssid);
  const [activeTab, setActiveTab] = useState<string>('textual');

  // Fetch config on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading styling configuration...</p>
        </div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => fetchConfig()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No configuration found for this venue</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Styling & Branding</h1>
          <p className="text-lg text-slate-600">
            Configure the look and feel of your hotspot portal for <strong>{ssid}</strong>
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
            <TabsTrigger value="textual">Text</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="venue">Venue</TabsTrigger>
            <TabsTrigger value="advertising">Ads</TabsTrigger>
          </TabsList>

          {/* Text Tab */}
          <TabsContent value="textual">
            <div className="bg-white rounded-lg shadow-md p-6">
              <TextualTab
                data={config?.textual}
                onSave={(updates) => updateSection('textual', updates)}
                loading={loading}
                error={error}
                saved={saved}
              />
            </div>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <div className="bg-white rounded-lg shadow-md p-6">
              <ColorsTab
                data={config?.colors}
                onSave={(updates) => updateSection('colors', updates)}
                loading={loading}
                error={error}
                saved={saved}
              />
            </div>
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons">
            <div className="bg-white rounded-lg shadow-md p-6">
              <ButtonsTab
                data={config?.buttons}
                onSave={(updates) => updateSection('buttons', updates)}
                loading={loading}
                error={error}
                saved={saved}
              />
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images">
            <div className="bg-white rounded-lg shadow-md p-6">
              <ImagesTab
                data={config?.images}
                onSave={(updates) => updateSection('images', updates)}
                loading={loading}
                error={error}
                saved={saved}
              />
            </div>
          </TabsContent>

          {/* Venue Tab */}
          <TabsContent value="venue">
            <div className="bg-white rounded-lg shadow-md p-6">
              <VenueTab
                data={config?.venue}
                onSave={(updates) => updateSection('venue', updates)}
                loading={loading}
                error={error}
                saved={saved}
              />
            </div>
          </TabsContent>

          {/* Advertising Tab */}
          <TabsContent value="advertising">
            <div className="bg-white rounded-lg shadow-md p-6">
              <AdvertisingTab
                data={config?.advertising}
                onSave={(updates) => updateSection('advertising', updates)}
                loading={loading}
                error={error}
                saved={saved}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
