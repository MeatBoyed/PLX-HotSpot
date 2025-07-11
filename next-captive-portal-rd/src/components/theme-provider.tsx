'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { applyTheme, pluxnetTheme, exampleBusinessTheme, yellowBrandTheme, BrandTheme } from '@/lib/theme';

interface ThemeContextType {
  currentTheme: BrandTheme;
  switchTheme: (theme: BrandTheme) => void;
  availableThemes: BrandTheme[];
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
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<BrandTheme>(pluxnetTheme);

  const availableThemes = [pluxnetTheme, exampleBusinessTheme, yellowBrandTheme];

  const switchTheme = (theme: BrandTheme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(pluxnetTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, switchTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}
