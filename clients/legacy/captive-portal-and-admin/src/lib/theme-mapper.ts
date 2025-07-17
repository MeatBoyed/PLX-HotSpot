/**
 * Theme Mapper - Maps CSS data-theme attributes to image theme objects
 * This allows us to sync CSS themes with React image themes
 */

import { pluxnetTheme, exampleBusinessTheme, CityOfJbhTheme, BrandTheme } from './theme';

export const themeMap: Record<string, BrandTheme> = {
    'pluxnet': pluxnetTheme,
    'city-of-jbh': CityOfJbhTheme,
    'example-business': exampleBusinessTheme,
};

/**
 * Get theme object from data-theme attribute value
 */
export function getThemeFromDataAttribute(dataTheme: string): BrandTheme {
    return themeMap[dataTheme] || pluxnetTheme; // Fallback to pluxnet
}

/**
 * Get current data-theme attribute value
 */
export function getCurrentDataTheme(): string {
    if (typeof window === 'undefined') return 'pluxnet';
    return document.documentElement.getAttribute('data-theme') || 'pluxnet';
}

/**
 * Set data-theme attribute (for theme switching)
 */
export function setDataTheme(themeId: string): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', themeId);
}

/**
 * Available theme options for theme switchers
 */
export const availableDataThemes = [
    { id: 'pluxnet', name: 'PluxNet' },
    { id: 'city-of-jbh', name: 'City of Johannesburg' },
    { id: 'example-business', name: 'Example Business' },
];
