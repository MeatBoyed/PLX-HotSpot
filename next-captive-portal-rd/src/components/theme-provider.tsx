'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { pluxnetTheme, exampleBusinessTheme, CityOfJbhTheme, BrandTheme } from '@/lib/theme';

// Map data-theme values to theme objects
const themeMap: Record<string, BrandTheme> = {
  'pluxnet': pluxnetTheme,
  'city-of-jbh': CityOfJbhTheme,
  'example-business': exampleBusinessTheme,
};

function getCurrentDataTheme(): string {
  if (typeof window === 'undefined') return 'pluxnet';
  return document.documentElement.getAttribute('data-theme') || 'pluxnet';
}

function getThemeFromDataAttribute(dataTheme: string): BrandTheme {
  return themeMap[dataTheme] || pluxnetTheme;
}

interface ThemeContextType {
  currentTheme: BrandTheme;
  availableThemes: BrandTheme[];
  // Helper function to get theme images easily
  getThemeImage: (imageKey: keyof BrandTheme['images']) => string;
  // Function to switch CSS themes
  switchCSSTheme: (themeId: string) => void;
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
  // Get initial theme based on data-theme attribute
  const [currentTheme, setCurrentTheme] = useState<BrandTheme>(() => {
    const dataTheme = getCurrentDataTheme();
    return getThemeFromDataAttribute(dataTheme);
  });

  const availableThemes = Object.values(themeMap);

  const getThemeImage = (imageKey: keyof BrandTheme['images']): string => {
    return currentTheme.images[imageKey] || '';
  };

  const switchCSSTheme = (themeId: string) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', themeId);
  };

  // Watch for data-theme changes and update image theme accordingly
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newDataTheme = getCurrentDataTheme();
          const newTheme = getThemeFromDataAttribute(newDataTheme);
          setCurrentTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      availableThemes,
      getThemeImage,
      switchCSSTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
