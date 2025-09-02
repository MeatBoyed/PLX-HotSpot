"use client";

import { useEffect, useState, useCallback } from "react";
import { hotspotAPI, schemas } from "@/lib/hotspotAPI";
import { BrandingConfig, FormFieldConfig, FormSectionConfig } from "@/lib/types";
import { CustomForm } from "@/components/ui/custom-form";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import Head from "@/components/home-page/head";
import { z } from "zod";

// Canonical update schema (partial & strict) reused directly; create a stripped variant to auto-drop unknown keys
const UpdateSchema = schemas.BrandingConfigUpdateBody; // partial().strict()
const StripSchema = UpdateSchema.strip(); // drops unknown keys instead of erroring
type UpdateInput = z.infer<typeof StripSchema>;

// Field groups
const brandingFields: FormFieldConfig[] = [
    { name: "name", label: "Display Name", type: "text", placeholder: "Venue WiFi" },
    { name: "logo", label: "Logo Path", type: "text", placeholder: "/pluxnet-logo.svg" },
    { name: "logoWhite", label: "Logo (White)", type: "text", placeholder: "/pluxnet-logo-white.svg" },
    { name: "connectCardBackground", label: "Connect Card Background", type: "text", placeholder: "/internet-claim-bg.png" },
    { name: "bannerOverlay", label: "Banner Overlay", type: "text", placeholder: "/banner-overlay.png" },
    { name: "favicon", label: "Favicon", type: "text", placeholder: "/favicon.ico" },
    { name: "heading", label: "Heading", type: "text", placeholder: "Connect to WiFi" },
    { name: "subheading", label: "Subheading", type: "text", placeholder: "Enjoy free internet" },
    { name: "buttonText", label: "Button Text", type: "text", placeholder: "Connect" },
    { name: "termsLinks", label: "Terms Links", type: "text", placeholder: "https://example.com/terms" },
];

const colorFields: FormFieldConfig[] = [
    { name: "brandPrimary", label: "Primary", type: "color", placeholder: "#301358" },
    { name: "brandPrimaryHover", label: "Primary Hover", type: "color", placeholder: "#5B3393" },
    { name: "brandSecondary", label: "Secondary", type: "color", placeholder: "#F2F2F2" },
    { name: "brandAccent", label: "Accent", type: "color", placeholder: "#F60031" },
    { name: "textPrimary", label: "Text Primary", type: "color", placeholder: "#181818" },
    { name: "textSecondary", label: "Text Secondary", type: "color", placeholder: "#5D5D5D" },
    { name: "textTertiary", label: "Text Tertiary", type: "color", placeholder: "#7A7A7A" },
    { name: "textMuted", label: "Text Muted", type: "color", placeholder: "#CECECE" },
    { name: "surfaceCard", label: "Surface Card", type: "color", placeholder: "#F2F2F2" },
    { name: "surfaceWhite", label: "Surface White", type: "color", placeholder: "#FFFFFF" },
    { name: "surfaceBorder", label: "Surface Border", type: "color", placeholder: "#CECECE" },
];

const buttonFields: FormFieldConfig[] = [
    { name: "buttonPrimary", label: "Button Primary", type: "text", placeholder: "#301358" },
    { name: "buttonPrimaryHover", label: "Button Primary Hover", type: "text", placeholder: "#5B3393" },
    { name: "buttonPrimaryText", label: "Button Primary Text", type: "text", placeholder: "#FFFFFF" },
    { name: "buttonSecondary", label: "Button Secondary", type: "text", placeholder: "#FFFFFF" },
    { name: "buttonSecondaryHover", label: "Button Secondary Hover", type: "text", placeholder: "#f5f5f5" },
    { name: "buttonSecondaryText", label: "Button Secondary Text", type: "text", placeholder: "#301358" },
];

const adFields: FormFieldConfig[] = [
    { name: "adsReviveServerUrl", label: "Revive Server URL", type: "text", placeholder: "https://servedby.revive-adserver.net/asyncjs.php" },
    { name: "adsZoneId", label: "Ad Zone Id", type: "text", placeholder: "20641" },
    { name: "adsReviveId", label: "Revive Publisher Id", type: "text", placeholder: "727bec5e09208690b050ccfc6a45d384" },
    { name: "adsVastUrl", label: "VAST URL", type: "text", placeholder: "https://example.com/vast.xml" },
];

// Hidden field (ssid only; id is not part of update body)
const hiddenFields: FormFieldConfig[] = [
    { name: "ssid", label: "ssid", type: "hidden" },
];

const sections: FormSectionConfig[] = [
    { title: "Brand Identity", description: "Logos, copy and assets.", fields: brandingFields },
    { title: "Colors", description: "Core palette.", fields: colorFields },
    { title: "Buttons", description: "Button styles.", fields: buttonFields },
    { title: "Advertising", description: "Ad & VAST configuration.", fields: adFields },
];

export default function BrandConfigAdminPage() {
    const { theme, refreshTheme, setTheme } = useTheme();
    const [submitting, setSubmitting] = useState(false);
    const [initialValues, setInitialValues] = useState<Record<string, unknown> | null>(null);

    // Build initial values from current theme (Zod will strip extras automatically)
    useEffect(() => {
        if (!theme) return;
        // Parse through stripped schema to drop non-update fields (id, createdAt, etc.)
        const parsed = StripSchema.parse(theme);
        setInitialValues({ ...parsed, ssid: theme.ssid });
    }, [theme]);

    const onSubmit = useCallback(async (raw: Record<string, unknown>) => {
        setSubmitting(true);
        const start = performance.now();
        try {
            // Normalize empty strings to undefined before validation
            const normalized: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(raw)) {
                normalized[k] = typeof v === "string" && v.trim() === "" ? undefined : v;
            }
            // Validate & auto-strip using stripped schema
            const parsed = StripSchema.safeParse(normalized);
            if (!parsed.success) {
                const messages = parsed.error.issues.map(i => `${i.path.join('.') || 'field'}: ${i.message}`);
                messages.forEach(m => toast.error(m));
                toast.error("Validation failed");
                return;
            }
            const body: UpdateInput = parsed.data as UpdateInput;

            // Determine ssid (query param authoritative from theme if available)
            const ssid = theme?.ssid || body.ssid;
            if (!ssid) {
                toast.error("Missing SSID context");
                return;
            }

            const response = await hotspotAPI.patchApiportalconfig(body, { queries: { ssid } });
            const updated = (response as { res: BrandingConfig }).res;
            setTheme(updated);
            toast.success("Branding updated");
            await refreshTheme();
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Update failed";
            console.error("[BrandConfig] Update error", e);
            toast.error(msg);
        } finally {
            setSubmitting(false);
            console.log(`[BrandConfig] Submit completed in ${(performance.now() - start).toFixed(0)}ms`);
        }
    }, [StripSchema, theme, refreshTheme, setTheme]);

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-8">
            <nav className="flex items-center justify-center w-full">
                <Head />
            </nav>
            <div>
                <h1 className="text-2xl font-semibold">Brand Configuration</h1>
                <p className="text-sm text-muted-foreground">
                    Update the active branding for SSID: <span className="font-medium">{theme?.ssid}</span>
                </p>
            </div>
            {initialValues && (
                <CustomForm
                    sections={[{ title: "Hidden", description: "Technical", fields: hiddenFields }, ...sections]}
                    schema={StripSchema}
                    onSubmit={onSubmit}
                    defaultValues={initialValues}
                    isSubmitting={submitting}
                />
            )}
        </div>
    );
}
