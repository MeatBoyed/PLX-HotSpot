'use client';


import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { pluxnetTheme } from '@/lib/theme';
import { BrandingConfig } from '@/lib/types';
import { hotspotAPI } from '@/lib/hotspotAPI';

const THEME_STORAGE_KEY = 'BrandingConfig';
const BRAND_CACHE_COOKIE_PREFIX = 'branding_fetch_'; // branding_fetch_<ssid>=1 cookie means fresh within TTL
const BRAND_CACHE_MAX_AGE_SEC = 180; // 3 minutes

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
  initialTheme?: BrandingConfig; // optional fast paint
  ssid: string; // branding identifier
  showInitialSpinner?: boolean; // default true
}

function getStoredTheme(): BrandingConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch { }
  return null;
}

function storeTheme(theme: BrandingConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch { }
}

export function ThemeProvider({ children, initialTheme, ssid, showInitialSpinner = true }: ThemeProviderProps) {
  // Track loading & error state
  const [loading, setLoading] = useState<boolean>(() => !initialTheme && showInitialSpinner);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  // Use provided initialTheme, or stored theme, or fallback
  const [theme, setThemeState] = useState<BrandingConfig>(() => initialTheme || getStoredTheme() || pluxnetTheme);

  // Persist theme to localStorage on change
  useEffect(() => { storeTheme(theme); }, [theme]);

  const applyThemeIfChanged = (incoming: BrandingConfig | null | undefined) => {
    if (!incoming) return;
    // Shallow diff on updatedAt or id
    if (theme.updatedAt !== incoming.updatedAt || theme.id !== incoming.id) {
      setThemeState(incoming);
    }
  };

  const brandingCookieName = `${BRAND_CACHE_COOKIE_PREFIX}${ssid}`;

  const hasValidBrandingCache = (): boolean => {
    if (typeof document === 'undefined') return false;
    const cookies = document.cookie.split(';').map(c => c.trim());
    return cookies.some(c => c.startsWith(`${brandingCookieName}=`));
  };

  const setBrandingCacheCookie = () => {
    if (typeof document === 'undefined') return;
    document.cookie = `${brandingCookieName}=1; Max-Age=${BRAND_CACHE_MAX_AGE_SEC}; Path=/`;
  };

  const normalizeBrandingResponse = (resp: unknown): BrandingConfig | undefined => {
    if (!resp || typeof resp !== 'object') return undefined;
    const obj = resp as Record<string, unknown>;
    // Check nested keys first
    const possibleNested = ['res', 'data'] as const;
    for (const key of possibleNested) {
      if (key in obj && obj[key] && typeof obj[key] === 'object') {
        const nested = obj[key] as Record<string, unknown>;
        if (typeof nested.ssid === 'string' && typeof nested.name === 'string') {
          return nested as unknown as BrandingConfig;
        }
      }
    }
    // Direct shape fallback
    if (typeof obj.ssid === 'string' && typeof obj.name === 'string') {
      return obj as unknown as BrandingConfig;
    }
    return undefined;
  };

  const fetchTheme = async (force = false) => {
    if (fetchingRef.current) return;
    // Skip fetch if cache valid and not forced
    if (!force && hasValidBrandingCache()) {
      setLoading(false);
      return;
    }
    fetchingRef.current = true;
    setError(null);
    try {
      const apiRes = await hotspotAPI.getApiportalconfig({ queries: { ssid } });
      const incoming = normalizeBrandingResponse(apiRes);
      applyThemeIfChanged(incoming);
      // Persist latest theme to localStorage explicitly after fetch
      if (incoming) {
        try { localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(incoming)); } catch { /* ignore */ }
      }
      setBrandingCacheCookie();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load branding config';
      setError(msg);
      setThemeState(pluxnetTheme);
      console.log("ThemeProvider Error (Failed to fetch theme): ", msg);
      // If no stored theme available fallback to pluxnet
      // if (!getStoredTheme()) {
      //   setThemeState(pluxnetTheme);
      // }
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  };

  // Initial fetch (always perform at least one client refresh so backend changes propagate even if server supplied initialTheme)
  useEffect(() => {
    // If stored theme's ssid mismatches current ssid, force fetch ignoring cache cookie
    const stored = getStoredTheme();
    const storedSsid = stored?.ssid as string | undefined;
    const force = !!(storedSsid && storedSsid !== ssid);
    fetchTheme(force);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssid]);

  // Manual setTheme exposed to consumers
  const setTheme = (newTheme: BrandingConfig) => setThemeState(newTheme || pluxnetTheme);

  // Manual refresh function (exposed)
  const refreshTheme = async () => { await fetchTheme(true); };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, refreshTheme, loading, error }}>
      {loading && showInitialSpinner ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-sm text-gray-500">Loading theme…</p>
            {/* {error && <p className="text-xs text-red-500">{error}</p>} */}
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
