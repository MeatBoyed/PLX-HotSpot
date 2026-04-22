'use client';

import { useState, useCallback } from 'react';
import { StylingConfigComplete } from '@/lib/services/styling-service';

type StylingSection = 'textual' | 'colors' | 'buttons' | 'images' | 'venue' | 'advertising';

export function useStylingConfig(ssid: string) {
  const [config, setConfig] = useState<StylingConfigComplete | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/styling?ssid=${encodeURIComponent(ssid)}`);
      if (!res.ok) throw new Error('Failed to fetch styling config');
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [ssid]);

  const updateSection = useCallback(
    async (section: StylingSection, updates: Record<string, any>) => {
      setError(null);
      setSaved(false);
      try {
        const res = await fetch(`/api/styling/${section}?ssid=${encodeURIComponent(ssid)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update styling');
        }

        const updated = await res.json();
        setConfig(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      }
    },
    [ssid]
  );

  const updateComplete = useCallback(
    async (updates: Partial<StylingConfigComplete>) => {
      setError(null);
      setSaved(false);
      try {
        const res = await fetch(`/api/styling?ssid=${encodeURIComponent(ssid)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update styling');
        }

        const updated = await res.json();
        setConfig(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      }
    },
    [ssid]
  );

  return {
    config,
    loading,
    error,
    saved,
    fetchConfig,
    updateSection,
    updateComplete,
  };
}
