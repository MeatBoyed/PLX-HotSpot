'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { pluxnetTheme } from '@/lib/theme';
import { BrandingConfig } from '@/lib/types';
import { normalizeBranding, brandingToCssVars } from '@/lib/utils/branding-normalize';
import { fetchBrandingConfigAction } from '@/lib/actions/branding-actions';

const STALE_CLIENT_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface ThemeContextType {
  theme: BrandingConfig;
  setTheme: (theme: BrandingConfig) => void;
  refreshTheme: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: BrandingConfig;
  ssid: string;
  showInitialSpinner?: boolean;
}

interface StoredThemeEntry {
  ssid: string;
  fetchedAt: number;
  theme: BrandingConfig;
}

function getStoredTheme(ssid: string): { theme: BrandingConfig; fetchedAt: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`branding:${ssid}`);
    if (!stored) return null;
    const parsed: StoredThemeEntry = JSON.parse(stored);
    const theme = normalizeBranding(parsed?.theme || parsed);
    return theme ? { theme, fetchedAt: parsed.fetchedAt ?? 0 } : null;
  } catch { return null; }
}

function storeTheme(ssid: string, theme: BrandingConfig, fetchedAt: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`branding:${ssid}`, JSON.stringify({ ssid, fetchedAt, theme }));
  } catch { }
}

export function ThemeProvider({ children, initialTheme, ssid, showInitialSpinner = true }: ThemeProviderProps) {
  const [loading, setLoading] = useState<boolean>(() => !initialTheme && showInitialSpinner);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  // Track when the current theme was fetched so the stale check uses fetch time, not DB update time
  const fetchedAtRef = useRef<number>(initialTheme ? Date.now() : 0);

  const [theme, setThemeState] = useState<BrandingConfig>(() => {
    if (initialTheme) return initialTheme;
    const stored = getStoredTheme(ssid);
    if (stored) { fetchedAtRef.current = stored.fetchedAt; return stored.theme; }
    return pluxnetTheme;
  });

  // Apply CSS vars to :root whenever theme changes
  useEffect(() => {
    const vars = brandingToCssVars(theme);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      if (value) root.style.setProperty(key, value);
    }
  }, [theme]);

  // Persist theme to localStorage on change
  useEffect(() => { storeTheme(ssid, theme, fetchedAtRef.current); }, [theme, ssid]);

  const applyThemeIfChanged = (incoming: BrandingConfig | null | undefined, fetchedAt: number) => {
    if (!incoming) return;
    if (theme.updatedAt !== incoming.updatedAt || theme.id !== incoming.id) {
      fetchedAtRef.current = fetchedAt;
      setThemeState(incoming);
    }
  };

  const isStoredFresh = (fetchedAt: number) => {
    return Date.now() - fetchedAt < STALE_CLIENT_TTL_MS;
  };

  const fetchTheme = async (force = false) => {
    if (!ssid) return; // root layout has no SSID — nothing to fetch
    if (fetchingRef.current) return;
    // Skip if the server just gave us fresh data (initialTheme present and fetched < TTL ago)
    if (!force && isStoredFresh(fetchedAtRef.current)) {
      setLoading(false);
      return;
    }
    fetchingRef.current = true;
    setError(null);
    try {
      const incoming = await fetchBrandingConfigAction(ssid);
      const normalized = normalizeBranding(incoming);
      applyThemeIfChanged(normalized, Date.now());
      if (normalized) storeTheme(ssid, normalized, fetchedAtRef.current);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load branding config';
      setError(msg);
      setThemeState(pluxnetTheme);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssid, initialTheme]);

  const setTheme = (newTheme: BrandingConfig) => setThemeState(newTheme || pluxnetTheme);
  const refreshTheme = async () => { await fetchTheme(true); };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, refreshTheme, loading, error }}>
      {loading && showInitialSpinner ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-sm text-gray-500">Loading theme…</p>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="fixed top-2 right-2 bg-red-100 border border-red-300 text-red-700 px-3 py-1 rounded text-xs shadow">
              Theme load error: {error}
            </div>
          )}
          {children}
        </>
      )}
    </ThemeContext.Provider>
  );
}

function Spinner() {
  return (
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-brandPrimary" aria-label="Loading" />
  );
}