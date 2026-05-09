import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { brandingService, gatewayService } from '@/application/services';
import { Toaster } from 'sonner';
import { env } from '@/env';
import { redirect } from 'next/navigation';

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
                icon: branding.favicon ?? '/favicon.svg',
                shortcut: branding.favicon ?? '/favicon.svg',
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
        // Fetch branding and gateway in parallel — gateway warms the server cache so
        // the page component's gatewayService.get() call is an instant cache hit.
        const [b] = await Promise.all([
            brandingService.get(ssid),
            gatewayService.get(ssid).catch(() => undefined),
        ]);
        branding = b;
    } catch (e) {
        const status = (e as Record<string, unknown>)?.status;
        if (status === 404) redirect('/');
        // non-404 errors fall back to default theme
    }

    return (
        <ThemeProvider ssid={ssid} initialTheme={branding} showInitialSpinner={!branding}>
            {children}
            <Toaster position="top-center" richColors />
        </ThemeProvider>
    );
}
