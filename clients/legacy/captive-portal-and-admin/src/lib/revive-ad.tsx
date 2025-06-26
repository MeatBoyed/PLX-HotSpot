"use client"
import { useEffect } from 'react';

interface ReviveAdProps {
  zoneId: string;
  reviveId: string;
}

const ReviveAd = ({ zoneId, reviveId }: ReviveAdProps) => {
  useEffect(() => {
    // Only inject script once per mount
    const existingScript = document.querySelector(
      'script[src="//servedby.revive-adserver.net/asyncjs.php"]'
    );

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = '//servedby.revive-adserver.net/asyncjs.php';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <ins
      className="revive-ad"
      data-revive-zoneid={zoneId}
      data-revive-id={reviveId}
      style={{ display: 'block' }}
    />
  );
};

export default ReviveAd;
