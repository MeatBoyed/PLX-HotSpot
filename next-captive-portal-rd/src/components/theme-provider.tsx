'use client';


import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { pluxnetTheme, BrandTheme, } from '@/lib/theme';

const THEME_STORAGE_KEY = 'brandTheme';

interface ThemeContextType {
  theme: BrandTheme;
  setTheme: (theme: BrandTheme) => void;
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
  initialTheme?: BrandTheme;
}

function getStoredTheme(): BrandTheme | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch { }
  return null;
}

function storeTheme(theme: BrandTheme) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch { }
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  // Use initialTheme prop, localStorage, or fallback to PluxNet
  const [theme, setThemeState] = useState<BrandTheme>(() => {
    return initialTheme || getStoredTheme() || pluxnetTheme;
  });

  // Persist theme to localStorage on change
  useEffect(() => {
    storeTheme(theme);
  }, [theme]);

  // Expose setTheme for runtime theme changes
  const setTheme = (newTheme: BrandTheme) => {
    setThemeState(newTheme || pluxnetTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
