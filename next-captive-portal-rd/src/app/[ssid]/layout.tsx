import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth/AuthContext';
import { brandingService, gatewayService } from '@/application/services';
import { Toaster } from 'sonner';
import { env } from '@/env';
import BottomNav from '@/components/layout/BottomNav';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ ssid: string }>;
}): Promise<Metadata> {
    const { ssid } = await params;
    try {
        const branding = await brandingService.get(ssid);
        return {
            title: branding.name ?? env.SITE_TITLE,
            description: env.SITE_DESCRIPTION,
            icons: {
                icon: branding.favicon ?? '/AuraConnect-48px.png',
                shortcut: branding.favicon ?? '/AuraConnect-48px.png',
            },
        };
    } catch {
        return { title: env.SITE_TITLE, description: env.SITE_DESCRIPTION };
    }
}

export default async function SiteLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ ssid: string }>;
}) {
    const { ssid } = await params;
    let branding = undefined;
    try {
        console.log(`[layout] fetching branding ssid="${ssid}" API_URL="${process.env.API_URL}" TENANT_ID="${process.env.TENANT_ID}"`);
        const [b] = await Promise.all([
            brandingService.get(ssid),
            gatewayService.get(ssid).catch((e: unknown) => {
                console.error(`[layout] gateway fetch failed ssid="${ssid}":`, e instanceof Error ? e.message : e);
                return undefined;
            }),
        ]);
        branding = b;
        console.log(`[layout] branding OK ssid="${ssid}" name="${b?.name}"`);
    } catch (e: unknown) {
        console.error(`[layout] branding fetch FAILED ssid="${ssid}":`, e instanceof Error ? e.message : e);
    }

    const tenantId = env.TENANT_ID;

    return (
        <ThemeProvider ssid={ssid} initialTheme={branding} showInitialSpinner={!branding}>
            <AuthProvider ssid={ssid} tenantId={tenantId}>
                {children}
                <BottomNav />
                <Toaster position="top-center" richColors />
            </AuthProvider>
        </ThemeProvider>
    );
}
