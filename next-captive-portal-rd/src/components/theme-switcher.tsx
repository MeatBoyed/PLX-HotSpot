'use client';

import { useTheme } from './theme-provider';
import { pluxnetTheme, CityOfJbhTheme, exampleBusinessTheme } from '@/lib/theme';
import Link from 'next/link';

const availableThemes = [
  { id: 'pluxnet', name: 'PluxNet', theme: pluxnetTheme },
  { id: 'city-of-jbh', name: 'City of Johannesburg', theme: CityOfJbhTheme },
  { id: 'example-business', name: 'Example Business', theme: exampleBusinessTheme },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleThemeSwitch = (newTheme: typeof pluxnetTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="flex gap-2 p-2">
      <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Theme:</span>
      {availableThemes.map(({ id, name, theme: themeObj }) => (
        <button
          key={id}
          onClick={() => handleThemeSwitch(themeObj)}
          className={`px-3 py-1 text-sm rounded border transition-colors ${theme.name === themeObj.name
            ? 'border-2 font-semibold'
            : 'border hover:bg-gray-100'
            }`}
          style={{
            backgroundColor: theme.name === themeObj.name ? theme.colors.brandPrimary : theme.colors.surfaceWhite,
            color: theme.name === themeObj.name ? theme.colors.buttonPrimaryText : theme.colors.textSecondary,
            borderColor: theme.colors.surfaceBorder,
          }}
        >
          {name}
        </button>
      ))}
      <Link href="/welcome">View Dashboard</Link>
    </div>
  );
}
