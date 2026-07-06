"use client"
import { useEffect } from 'react';
import { useTheme } from "@/components/theme-provider"

// <!-- Revive Adserver Asynchronous JS Tag - Generated with Revive Adserver v6.0.0-rc1 -->
// <ins data-revive-zoneid="1" data-revive-target="_top" data-revive-id=""></ins>

const AdBanner = () => {
  const { theme } = useTheme()
  const src = theme?.adsReviveServerUrl?.replace("https:", "") || ""

  useEffect(() => {
    if (!src) return;
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [src]);

  if (!src || !theme.adsReviveId || !theme.adsZoneId) return null;

  return (
    <ins
      className="revive-ad"
      data-revive-zoneid={theme.adsZoneId}
      data-revive-id={theme.adsReviveId}
      style={{ display: 'block' }}
    />
  );
};

export default AdBanner;
