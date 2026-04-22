import { env } from '@/env';
import { StylesPageInner } from './StylesPageInner';

export default function StylesPage() {
  const ssid = env.NEXT_PUBLIC_SSID;

  return <StylesPageInner ssid={ssid} />;
}
