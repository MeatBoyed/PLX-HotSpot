'use client';

import { useTheme } from './theme-provider';

export function ThemeSwitcher() {
  const { currentTheme, switchTheme, availableThemes } = useTheme();

  return (
    <div className="flex gap-2 p-2">
      <span className="text-sm font-medium text-text-secondary">Theme:</span>
      {availableThemes.map((theme) => (
        <button
          key={theme.name}
          onClick={() => switchTheme(theme)}
          className={`px-3 py-1 text-sm rounded border transition-colors ${currentTheme.name === theme.name
              ? 'border-2 font-semibold'
              : 'border hover:bg-gray-100'
            }`}
          style={{
            backgroundColor: currentTheme.name === theme.name ? 'var(--brand-primary)' : 'var(--surface-white)',
            color: currentTheme.name === theme.name ? 'var(--button-primary-text)' : 'var(--text-secondary)',
            borderColor: 'var(--surface-border)'
          }}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
}
