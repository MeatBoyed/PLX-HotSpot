'use client';

import { useTheme } from './theme-provider';

/**
 * Custom hook to easily access theme images
 */
export function useThemeImages() {
  const { currentTheme } = useTheme();
  
  return {
    logo: currentTheme.images.logo,
    logoWhite: currentTheme.images.logoWhite,
    connectCardBackground: currentTheme.images.connectCardBackground,
    bannerOverlay: currentTheme.images.bannerOverlay,
    favicon: currentTheme.images.favicon,
  };
}
