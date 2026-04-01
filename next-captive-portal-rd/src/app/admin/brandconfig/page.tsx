"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { schemas } from "@/lib/hotspotAPI";
import { FormFieldConfig, BrandingConfig } from "@/lib/types";
import { useTheme } from "@/components/theme-provider";
import { Navbar } from "@/components/home-page/head";
import { z } from "zod";
import ImageField from "./ImageField";
import useBrandConfigForm from "./useBrandConfigForm";
import { updateBrandIdentityAction, updateButtonsAction, updateColorsAction, updateAdsAction } from './actions';
import SectionForm from "./SectionForm";
import AdSection from "@/components/ad-section";
import { fetchBrandingConfigAction } from "@/lib/actions/branding-actions";

// Canonical update schema (partial & strict) reused directly; create a stripped variant to auto-drop unknown keys
const UpdateSchema = schemas.BrandingConfigUpdateBody; // partial().strict()
const StripSchema = UpdateSchema.strip(); // drops unknown keys instead of erroring
type UpdateInput = z.infer<typeof StripSchema>;

// Field groups
const brandingFields: FormFieldConfig[] = [
    { name: "name", label: "Display Name", type: "text", placeholder: "Venue WiFi" },
    { name: "heading", label: "Heading", type: "text", placeholder: "Connect to WiFi" },
    { name: "subheading", label: "Subheading", type: "text", placeholder: "Enjoy free internet" },
    { name: "buttonText", label: "Button Text", type: "text", placeholder: "Connect" },
    { name: "termsLinks", label: "Terms Links", type: "text", placeholder: "https://example.com/terms" },
    { name: "splashHeading", label: "Splash Heading", type: "text", placeholder: "Welcome to the hotspot" },
    // Auth methods (multi-select)
    {
        name: "authMethods", label: "Allowed Authentication Methods", type: "multiselect", options: [
            { value: "free", label: "Free Access" },
            { value: "voucher", label: "Voucher" },
            { value: "pu-login", label: "Permanent User Login" },
            { value: "pu-phonename", label: "PU Phone Login" },
        ]
    },
    { name: "marketingOptIn", label: "Marketing Opt-In Email Field", type: "checkbox" },
    { name: "venueLabel", label: "Venue Dropdown Label", type: "text", placeholder: "e.g. Soweto Theatre" },
    { name: "venueRoute", label: "Venue Route", type: "text", placeholder: "e.g. /soweto-theatre" },
    { name: "parentSsid", label: "Parent SSID (sub-venue only)", type: "text", placeholder: "e.g. joburg-theatre" },
    { name: "sortOrder", label: "Dropdown Sort Order", type: "text", placeholder: "0" },
];

// Image fields moved to their own section
const imageFields: FormFieldConfig[] = [
    { name: "logo", label: "Logo", type: "text", placeholder: "/pluxnet-logo.svg" },
    { name: "logoWhite", label: "Logo (White)", type: "text", placeholder: "/pluxnet-logo-white.svg" },
    { name: "connectCardBackground", label: "Connect Card Background", type: "text", placeholder: "/internet-claim-bg.png" },
    { name: "bannerOverlay", label: "Banner Overlay", type: "text", placeholder: "/banner-overlay.png" },
    { name: "favicon", label: "Favicon", type: "text", placeholder: "/favicon.ico" },
    { name: "splashBackground", label: "Splash Background", type: "text", placeholder: "/splash-bg.png" },
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
    { name: "buttonPrimary", label: "Button Primary", type: "color", placeholder: "#301358" },
    { name: "buttonPrimaryHover", label: "Button Primary Hover", type: "color", placeholder: "#5B3393" },
    { name: "buttonPrimaryText", label: "Button Primary Text", type: "color", placeholder: "#FFFFFF" },
    { name: "buttonSecondary", label: "Button Secondary", type: "color", placeholder: "#FFFFFF" },
    { name: "buttonSecondaryHover", label: "Button Secondary Hover", type: "color", placeholder: "#f5f5f5" },
    { name: "buttonSecondaryText", label: "Button Secondary Text", type: "color", placeholder: "#301358" },
];

const adFields: FormFieldConfig[] = [
    { name: "adsReviveServerUrl", label: "Revive Server URL", type: "text", placeholder: "https://servedby.revive-adserver.net/asyncjs.php" },
    { name: "adsZoneId", label: "Ad Zone Id", type: "text", placeholder: "20641" },
    { name: "adsReviveId", label: "Revive Publisher Id", type: "text", placeholder: "727bec5e09208690b050ccfc6a45d384" },
    { name: "adsVastUrl", label: "VAST URL", type: "text", placeholder: "https://example.com/vast.xml" },
];

// Note: sections constant removed to avoid unused variable lint.

const KNOWN_SSIDS = ["joburg-theatre", "roodepoort-theatre", "soweto-theatre"];

export default function BrandConfigAdminPage() {
    const { theme: rootTheme } = useTheme(); // root ThemeProvider — never mutated by admin
    const searchParams = useSearchParams();
    const router = useRouter();

    // Local editing state — completely isolated from the root ThemeProvider
    const [editingTheme, setEditingTheme] = useState<BrandingConfig | null>(null);
    const [loadingTheme, setLoadingTheme] = useState(false);

    const activeTheme = editingTheme ?? rootTheme;
    const activeSsid = activeTheme?.ssid ?? "";

    const switchSsid = useCallback(async (ssid: string) => {
        router.replace(`/admin/brandconfig?ssid=${ssid}`);
        setLoadingTheme(true);
        try {
            const config = await fetchBrandingConfigAction(ssid);
            setEditingTheme(config);
        } catch {
            // keep current
        } finally {
            setLoadingTheme(false);
        }
    }, [router]);

    // On mount, load ?ssid= param if present
    useEffect(() => {
        const paramSsid = searchParams.get("ssid");
        if (paramSsid) {
            switchSsid(paramSsid);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // refreshTheme for this admin context — re-fetches the currently editing SSID into local state only
    const refreshEditingTheme = useCallback(async () => {
        if (!activeSsid) return;
        try {
            const config = await fetchBrandingConfigAction(activeSsid);
            setEditingTheme(config);
        } catch { /* noop */ }
    }, [activeSsid]);

    const { initialValues, objectUrlsRef, handleFileChange, uploadImage, uploadingByField } = useBrandConfigForm<UpdateInput>({
        theme: activeTheme,
        setTheme: setEditingTheme,
        refreshTheme: refreshEditingTheme,
        StripSchema,
    });

    useEffect(() => { return () => { /* noop */ } }, []);

    return (
        <div className="md:min-w-xl md:max-w-3xl mx-auto py-8 space-y-8">
            <nav className="flex items-center justify-center w-full">
                <Navbar />
            </nav>
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Brand Configuration</h1>
                    <p className="text-sm text-muted-foreground">
                        Editing SSID: <span className="font-medium">{activeSsid}</span>
                        {loadingTheme && <span className="ml-2 text-xs text-gray-400">Loading...</span>}
                    </p>
                </div>
                <select
                    value={activeSsid}
                    onChange={(e) => switchSsid(e.target.value)}
                    className="border rounded px-3 py-1.5 text-sm bg-white"
                    disabled={loadingTheme}
                >
                    {KNOWN_SSIDS.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
            {initialValues && (
                <div className="space-y-10">
                    {/* Identity Section - now text/meta only */}
                    <SectionForm
                        title="Brand Identity"
                        description="Copy and meta information."
                        fields={brandingFields}
                        schema={StripSchema}
                        defaultValues={initialValues}
                        ssid={activeSsid}
                        action={updateBrandIdentityAction}
                        onUpdated={async (updated) => { setEditingTheme(updated); await refreshEditingTheme(); }}
                    />

                    {/* Images Section - handles uploads separately */}
                    <SectionForm
                        title="Images"
                        description="Logos and backgrounds."
                        fields={imageFields}
                        schema={StripSchema}
                        defaultValues={initialValues}
                        ssid={activeSsid}
                        action={updateBrandIdentityAction}
                        onUpdated={async (updated) => { setEditingTheme(updated); await refreshEditingTheme(); }}
                        fieldRenderers={{
                            logo: ({ value }: { value: unknown }) => (
                                <ImageField
                                    name="logo"
                                    label="Logo"
                                    value={value}
                                    onFile={handleFileChange}
                                    previewUrls={objectUrlsRef.current}
                                    onUpload={uploadImage}
                                    uploading={!!uploadingByField["logo"]}
                                    ssid={activeSsid}
                                />
                            ),
                            logoWhite: ({ value }: { value: unknown }) => (
                                <ImageField
                                    name="logoWhite"
                                    label="Logo (White)"
                                    value={value}
                                    onFile={handleFileChange}
                                    previewUrls={objectUrlsRef.current}
                                    onUpload={uploadImage}
                                    uploading={!!uploadingByField["logoWhite"]}
                                    ssid={activeSsid}
                                />
                            ),
                            connectCardBackground: ({ value }: { value: unknown }) => (
                                <ImageField
                                    name="connectCardBackground"
                                    label="Connect Card Background"
                                    value={value}
                                    onFile={handleFileChange}
                                    previewUrls={objectUrlsRef.current}
                                    onUpload={uploadImage}
                                    uploading={!!uploadingByField["connectCardBackground"]}
                                    ssid={activeSsid}
                                />
                            ),
                            bannerOverlay: ({ value }: { value: unknown }) => (
                                <ImageField
                                    name="bannerOverlay"
                                    label="Banner Overlay"
                                    value={value}
                                    onFile={handleFileChange}
                                    previewUrls={objectUrlsRef.current}
                                    onUpload={uploadImage}
                                    uploading={!!uploadingByField["bannerOverlay"]}
                                    ssid={activeSsid}
                                />
                            ),
                            favicon: ({ value }: { value: unknown }) => (
                                <ImageField
                                    name="favicon"
                                    label="Favicon"
                                    value={value}
                                    onFile={handleFileChange}
                                    previewUrls={objectUrlsRef.current}
                                    onUpload={uploadImage}
                                    uploading={!!uploadingByField["favicon"]}
                                    ssid={activeSsid}
                                />
                            ),
                            splashBackground: ({ value }: { value: unknown }) => (
                                <ImageField
                                    name="splashBackground"
                                    label="Splash Background"
                                    value={value}
                                    onFile={handleFileChange}
                                    previewUrls={objectUrlsRef.current}
                                    onUpload={uploadImage}
                                    uploading={!!uploadingByField["splashBackground"]}
                                    ssid={activeSsid}
                                />
                            ),
                        }}
                    />

                    {/* Colors Section */}
                    <SectionForm
                        title="Colors"
                        description="Core palette."
                        fields={colorFields}
                        schema={StripSchema}
                        defaultValues={initialValues}
                        ssid={activeSsid}
                        action={updateColorsAction}
                        onUpdated={async (updated) => { setEditingTheme(updated); await refreshEditingTheme(); }}
                    />

                    {/* Buttons Section */}
                    <SectionForm
                        title="Buttons"
                        description="Button styles."
                        fields={buttonFields}
                        schema={StripSchema}
                        defaultValues={initialValues}
                        ssid={activeSsid}
                        action={updateButtonsAction}
                        onUpdated={async (updated) => { setEditingTheme(updated); await refreshEditingTheme(); }}
                    />

                    {/* Advertising Section */}
                    <SectionForm
                        title="Advertising"
                        description="Ad & VAST configuration."
                        fields={adFields}
                        schema={StripSchema}
                        defaultValues={initialValues}
                        ssid={activeSsid}
                        action={updateAdsAction}
                        onUpdated={async (updated) => { setEditingTheme(updated); await refreshEditingTheme(); }}
                    />

                    {/* Advertising Preview (uses shared component) */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Ad Preview</h3>
                        <p className="text-xs text-muted-foreground">Preview uses the current advertising configuration. Save the Advertising form to update.</p>
                        <AdSection />
                    </div>
                </div>
            )}
        </div>
    );
}

// interface ImageFieldProps {
//     name: string;
//     label: string;
//     value: unknown;
//     onFile: (field: string, file: File | undefined) => void;
//     previewUrls: Record<string, string>;
//     readOnlyPath?: boolean;
// }

// const ImageField: React.FC<ImageFieldProps> = ({ name, label, value, onFile, previewUrls, readOnlyPath }) => {
//     const currentPath = typeof value === 'string' ? value : '';
//     const preview = previewUrls[name] || (currentPath ? (currentPath.startsWith('http') ? currentPath : currentPath) : '');
//     return (
//         <div className="space-y-2">
//             <label className="text-sm font-medium flex items-center justify-between">
//                 <span>{label}</span>
//             </label>
//             {readOnlyPath && (
//                 <input
//                     type="text"
//                     value={currentPath}
//                     readOnly
//                     className="w-full text-xs bg-muted/40 border rounded px-2 py-1 font-mono"
//                     title={currentPath}
//                 />
//             )}
//             <div className="flex items-start gap-4">
//                 <div className="w-32 h-32 border rounded bg-muted/20 flex items-center justify-center overflow-hidden">
//                     {preview ? (
//                         // eslint-disable-next-line @next/next/no-img-element
//                         <img src={preview} alt={label} className="object-contain max-w-full max-h-full" />
//                     ) : (
//                         <span className="text-xs text-muted-foreground">No image</span>
//                     )}
//                 </div>
//                 <div className="flex flex-col gap-2 flex-1">
//                     <input
//                         type="file"
//                         accept="image/png,image/jpeg,image/webp"
//                         onChange={(e) => {
//                             const file = e.target.files?.[0];
//                             onFile(name, file);
//                         }}
//                         className="text-xs"
//                     />
//                     <p className="text-[10px] text-muted-foreground">PNG, JPEG, WEBP up to 20MB. Selecting a file will replace existing image after save.</p>
//                 </div>
//             </div>
//         </div>
//     );
// };
