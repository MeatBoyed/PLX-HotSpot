"use client"
import { useEffect } from 'react';
import { useTheme } from "@/components/theme-provider"

const AdBanner = () => {
  const { theme } = useTheme()
  const src = theme?.adsReviveServerUrl?.replace("https:", "") || ""
  console.log("Revive Server URL: ", src)

  useEffect(() => {
    // Only inject script once per mount
    const existingScript = document.querySelector(`script[src="${src}"]`);

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [src]);

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
