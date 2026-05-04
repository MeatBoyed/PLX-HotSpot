import { ThemeProvider } from "@/components/theme-provider";
import { brandingService } from "@/application/services";
import { Toaster } from "sonner";

export default async function SubVenueLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ subvenue: string }>;
}) {
    const { subvenue } = await params;
    let branding = undefined;
    try {
        branding = await brandingService.get(subvenue);
    } catch {
        // falls back to default theme inside ThemeProvider
    }

    return (
        <ThemeProvider ssid={subvenue} initialTheme={branding} showInitialSpinner={!branding}>
            {children}
            <Toaster position="top-center" richColors />
        </ThemeProvider>
    );
}
