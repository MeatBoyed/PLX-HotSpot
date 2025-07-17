'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './theme-provider';

const availableThemes = [
  { id: 'pluxnet', name: 'PluxNet' },
  { id: 'city-of-jbh', name: 'City of Johannesburg' },
  { id: 'example-business', name: 'Example Business' },
];

export function ThemeSwitcher() {
  const { switchCSSTheme } = useTheme();
  const [currentDataTheme, setCurrentDataTheme] = useState('pluxnet');

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'pluxnet';
    setCurrentDataTheme(currentTheme);
  }, []);

  const handleThemeSwitch = (themeId: string) => {
    switchCSSTheme(themeId);
    setCurrentDataTheme(themeId);
  };

  return (
    <div className="flex gap-2 p-2">
      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Theme:</span>
      {availableThemes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => handleThemeSwitch(theme.id)}
          className={`px-3 py-1 text-sm rounded border transition-colors ${currentDataTheme === theme.id
            ? 'border-2 font-semibold'
            : 'border hover:bg-gray-100'
            }`}
          style={{
            backgroundColor: currentDataTheme === theme.id ? 'var(--brand-primary)' : 'var(--surface-white)',
            color: currentDataTheme === theme.id ? 'var(--button-primary-text)' : 'var(--text-secondary)',
            borderColor: 'var(--surface-border)'
          }}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
}
