"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
    // Image fields will be rendered read-only path + upload widget via custom renderer
    { name: "logo", label: "Logo", type: "text", placeholder: "/pluxnet-logo.svg" },
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
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
    const objectUrlsRef = useRef<Record<string, string>>({});

    const imageFields = ["logo", "logoWhite", "connectCardBackground", "bannerOverlay", "favicon"] as const;
    const allowedMime = new Set(["image/png", "image/jpeg", "image/webp"]);
    const maxBytes = 20 * 1024 * 1024;

    const handleFileChange = (field: string, file: File | undefined) => {
        setSelectedFiles(prev => {
            const next = { ...prev };
            if (file) next[field] = file; else delete next[field];
            return next;
        });
        // Manage object URL for preview
        if (objectUrlsRef.current[field]) {
            URL.revokeObjectURL(objectUrlsRef.current[field]);
            delete objectUrlsRef.current[field];
        }
        if (file) {
            objectUrlsRef.current[field] = URL.createObjectURL(file);
        }
    };

    useEffect(() => () => {
        // cleanup URLs on unmount
        Object.values(objectUrlsRef.current).forEach(u => URL.revokeObjectURL(u));
    }, []);

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
            // Decide JSON vs multipart
            const hasFiles = Object.keys(selectedFiles).length > 0;
            let updated: BrandingConfig | null = null;
            if (!hasFiles) {
                const response = await hotspotAPI.patchApiportalconfig(body, { queries: { ssid } });
                updated = (response as { res: BrandingConfig }).res;
            } else {
                // Client-side file validation
                for (const [field, file] of Object.entries(selectedFiles)) {
                    if (!allowedMime.has(file.type)) {
                        toast.error(`${field}: Unsupported file type`);
                        return;
                    }
                    if (file.size > maxBytes) {
                        toast.error(`${field}: File exceeds 20MB limit`);
                        return;
                    }
                }
                const formData = new FormData();
                // Omit image path keys that have a file (backend will set path)
                const jsonPayload: Record<string, unknown> = { ...body };
                for (const f of Object.keys(selectedFiles)) {
                    delete jsonPayload[f];
                }
                jsonPayload.ssid = ssid; // ensure
                formData.append('json', JSON.stringify(jsonPayload));
                for (const [field, file] of Object.entries(selectedFiles)) {
                    formData.append(field, file, file.name);
                }
                const url = new URL(hotspotAPI.baseURL + '/api/portal/config');
                url.searchParams.set('ssid', ssid);
                const resp = await fetch(url.toString(), { method: 'PATCH', body: formData });
                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    if (err?.fileErrors) {
                        toast.error('Some images failed');
                        (err.fileErrors as any[]).forEach(f => toast.error(`${f.field}: ${f.reason}`));
                    } else {
                        toast.error(err.error || 'Upload failed');
                    }
                    return;
                }
                const json = await resp.json();
                updated = (json as { res: BrandingConfig }).res;
            }
            if (updated) {
                setTheme(updated);
                toast.success("Branding updated");
                await refreshTheme();
                // Reset selected files after success
                setSelectedFiles({});
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Update failed";
            console.error("[BrandConfig] Update error", e);
            toast.error(msg);
        } finally {
            setSubmitting(false);
            console.log(`[BrandConfig] Submit completed in ${(performance.now() - start).toFixed(0)}ms`);
        }
    }, [StripSchema, theme, refreshTheme, setTheme, selectedFiles]);

    return (
        <div className="md:min-w-xl md:max-w-3xl mx-auto py-8 space-y-8">
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
                    sections={[...sections]}
                    schema={StripSchema}
                    onSubmit={onSubmit}
                    defaultValues={initialValues}
                    isSubmitting={submitting}
                    fieldRenderers={{
                        logo: ({ value }) => <ImageField name="logo" label="Logo" value={value} onFile={handleFileChange} previewUrls={objectUrlsRef.current} readOnlyPath />,
                        logoWhite: ({ value }) => <ImageField name="logoWhite" label="Logo (White)" value={value} onFile={handleFileChange} previewUrls={objectUrlsRef.current} readOnlyPath />,
                        connectCardBackground: ({ value }) => <ImageField name="connectCardBackground" label="Connect Card Background" value={value} onFile={handleFileChange} previewUrls={objectUrlsRef.current} readOnlyPath />,
                        bannerOverlay: ({ value }) => <ImageField name="bannerOverlay" label="Banner Overlay" value={value} onFile={handleFileChange} previewUrls={objectUrlsRef.current} readOnlyPath />,
                        favicon: ({ value }) => <ImageField name="favicon" label="Favicon" value={value} onFile={handleFileChange} previewUrls={objectUrlsRef.current} readOnlyPath />,
                    }}
                />
            )}
        </div>
    );
}

interface ImageFieldProps {
    name: string;
    label: string;
    value: unknown;
    onFile: (field: string, file: File | undefined) => void;
    previewUrls: Record<string, string>;
    readOnlyPath?: boolean;
}

const ImageField: React.FC<ImageFieldProps> = ({ name, label, value, onFile, previewUrls, readOnlyPath }) => {
    const currentPath = typeof value === 'string' ? value : '';
    const preview = previewUrls[name] || (currentPath ? (currentPath.startsWith('http') ? currentPath : currentPath) : '');
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
                <span>{label}</span>
            </label>
            {readOnlyPath && (
                <input
                    type="text"
                    value={currentPath}
                    readOnly
                    className="w-full text-xs bg-muted/40 border rounded px-2 py-1 font-mono"
                    title={currentPath}
                />
            )}
            <div className="flex items-start gap-4">
                <div className="w-32 h-32 border rounded bg-muted/20 flex items-center justify-center overflow-hidden">
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt={label} className="object-contain max-w-full max-h-full" />
                    ) : (
                        <span className="text-xs text-muted-foreground">No image</span>
                    )}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            onFile(name, file);
                        }}
                        className="text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">PNG, JPEG, WEBP up to 20MB. Selecting a file will replace existing image after save.</p>
                </div>
            </div>
        </div>
    );
};
