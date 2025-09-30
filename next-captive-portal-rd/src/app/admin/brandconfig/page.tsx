"use client";

import { useEffect } from "react";
import { schemas } from "@/lib/hotspotAPI";
import { FormFieldConfig, FormSectionConfig } from "@/lib/types";
import { CustomForm } from "@/components/ui/custom-form";
import { useTheme } from "@/components/theme-provider";
import Head from "@/components/home-page/head";
import { z } from "zod";
import ImageField from "./ImageField";
import useBrandConfigForm from "./useBrandConfigForm";

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

    // Splash page fields
    { name: "splashBackground", label: "Splash Background", type: "text", placeholder: "/splash-bg.png" },
    { name: "splashHeading", label: "Splash Heading", type: "text", placeholder: "Welcome to the hotspot" },

    // Auth methods (multi-select)
    {
        name: "authMethods", label: "Allowed Authentication Methods", type: "multiselect", options: [
            { value: "free", label: "Free Access" },
            { value: "voucher", label: "Voucher" },
        ]
    },
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

const sections: FormSectionConfig[] = [
    { title: "Brand Identity", description: "Logos, copy and assets.", fields: brandingFields },
    { title: "Colors", description: "Core palette.", fields: colorFields },
    { title: "Buttons", description: "Button styles.", fields: buttonFields },
    { title: "Advertising", description: "Ad & VAST configuration.", fields: adFields },
];

export default function BrandConfigAdminPage() {
    const { theme, refreshTheme, setTheme } = useTheme();
    const { submitting, initialValues, objectUrlsRef, handleFileChange, onSubmit, uploadImage, uploadingByField } = useBrandConfigForm<UpdateInput>({
        theme,
        setTheme,
        refreshTheme,
        StripSchema,
    });

    // Unmount cleanup for previews handled in hook; retain to satisfy dependency array lint for now
    useEffect(() => { return () => { /* noop */ } }, []);

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
                        logo: ({ value }) => (
                            <ImageField
                                name="logo"
                                label="Logo"
                                value={value}
                                onFile={handleFileChange}
                                previewUrls={objectUrlsRef.current}
                                readOnlyPath
                                onUpload={uploadImage}
                                uploading={!!uploadingByField["logo"]}
                            />
                        ),
                        logoWhite: ({ value }) => (
                            <ImageField
                                name="logoWhite"
                                label="Logo (White)"
                                value={value}
                                onFile={handleFileChange}
                                previewUrls={objectUrlsRef.current}
                                readOnlyPath
                                onUpload={uploadImage}
                                uploading={!!uploadingByField["logoWhite"]}
                            />
                        ),
                        connectCardBackground: ({ value }) => (
                            <ImageField
                                name="connectCardBackground"
                                label="Connect Card Background"
                                value={value}
                                onFile={handleFileChange}
                                previewUrls={objectUrlsRef.current}
                                readOnlyPath
                                onUpload={uploadImage}
                                uploading={!!uploadingByField["connectCardBackground"]}
                            />
                        ),
                        bannerOverlay: ({ value }) => (
                            <ImageField
                                name="bannerOverlay"
                                label="Banner Overlay"
                                value={value}
                                onFile={handleFileChange}
                                previewUrls={objectUrlsRef.current}
                                readOnlyPath
                                onUpload={uploadImage}
                                uploading={!!uploadingByField["bannerOverlay"]}
                            />
                        ),
                        favicon: ({ value }) => (
                            <ImageField
                                name="favicon"
                                label="Favicon"
                                value={value}
                                onFile={handleFileChange}
                                previewUrls={objectUrlsRef.current}
                                readOnlyPath
                                onUpload={uploadImage}
                                uploading={!!uploadingByField["favicon"]}
                            />
                        ),
                        splashBackground: ({ value }) => (
                            <ImageField
                                name="splashBackground"
                                label="Splash Background"
                                value={value}
                                onFile={handleFileChange}
                                previewUrls={objectUrlsRef.current}
                                readOnlyPath
                                onUpload={uploadImage}
                                uploading={!!uploadingByField["splashBackground"]}
                            />
                        ),
                    }}
                />
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
