import { gatewayService } from '@/application/services';
import SitePageContent from './SitePageContent';
import type { GatewayConfig } from '@/lib/types';

export default async function SitePage({ params }: { params: Promise<{ ssid: string }> }) {
  const { ssid } = await params;

  let gatewayConfig: GatewayConfig = { loginUrl: '', freeUsername: '', freePassword: '' };
  try {
    gatewayConfig = await gatewayService.get(ssid);
  } catch {
    // gateway config unavailable — connect forms will fail at the AP level
  }

  return <SitePageContent gatewayConfig={gatewayConfig} />;
}
