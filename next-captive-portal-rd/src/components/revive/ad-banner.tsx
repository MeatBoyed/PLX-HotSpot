"use client"
import { useEffect } from 'react';
import { useTheme } from "@/components/theme-provider"

// <!-- Revive Adserver Asynchronous JS Tag - Generated with Revive Adserver v6.0.0-rc1 -->
// <ins data-revive-zoneid="1" data-revive-target="_top" data-revive-id=""></ins>

const AdBanner = () => {
  const { theme } = useTheme()
  const src = theme?.adsReviveServerUrl?.replace("https:", "") || ""
  // const src = "//102.213.200.91/revive-adserver-6.0.0-rc1/www/delivery/asyncjs.php"
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
      // data-revive-zoneid={"1"}
      data-revive-id={theme.adsReviveId}
      // data-revive-id={"6040b6bf48402d6ecad1ef6a54b77749"}
      style={{ display: 'block' }}
    />
  );
};

export default AdBanner;
