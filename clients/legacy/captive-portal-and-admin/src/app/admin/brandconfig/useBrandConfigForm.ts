"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hotspotAPI } from "@/lib/hotspotAPI";
import { BrandingConfig } from "@/lib/types";
import { toast } from "sonner";
import { z } from "zod";

export type UseBrandConfigFormArgs<T> = {
    theme: BrandingConfig | null | undefined;
    setTheme: (t: BrandingConfig) => void;
    refreshTheme: () => Promise<void>;
    StripSchema: z.ZodType<T>;
};

export function useBrandConfigForm<T extends Record<string, unknown>>({ theme, setTheme, refreshTheme, StripSchema }: UseBrandConfigFormArgs<T>) {
    const [submitting, setSubmitting] = useState(false);
    const [initialValues, setInitialValues] = useState<Record<string, unknown> | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
    const [uploadingByField, setUploadingByField] = useState<Record<string, boolean>>({});
    const objectUrlsRef = useRef<Record<string, string>>({});

    const allowedMime = useMemo(() => new Set(["image/png", "image/jpeg", "image/webp"]), []);
    const maxBytes = 20 * 1024 * 1024;

    const handleFileChange = (field: string, file: File | undefined) => {
        setSelectedFiles(prev => {
            const next = { ...prev };
            if (file) next[field] = file; else delete next[field];
            return next;
        });
        if (objectUrlsRef.current[field]) {
            URL.revokeObjectURL(objectUrlsRef.current[field]);
            delete objectUrlsRef.current[field];
        }
        if (file) {
            objectUrlsRef.current[field] = URL.createObjectURL(file);
        }
    };

    useEffect(() => () => {
        Object.values(objectUrlsRef.current).forEach(u => URL.revokeObjectURL(u));
    }, []);

    useEffect(() => {
        if (!theme) return;
        const parsed = StripSchema.parse(theme);
        setInitialValues({ ...parsed, ssid: theme.ssid });
    }, [theme, StripSchema]);

    const onSubmit = useCallback(async (raw: Record<string, unknown>) => {
        setSubmitting(true);
        const start = performance.now();
        try {
            const normalized: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(raw)) {
                // Normalize empty strings to undefined so they can be omitted
                if (typeof v === "string" && v.trim() === "") {
                    normalized[k] = undefined;
                    continue;
                }
                // Ensure authMethods is always a string[] when present
                if (k === "authMethods") {
                    if (Array.isArray(v)) {
                        normalized[k] = v.filter((x) => typeof x === "string");
                    } else if (typeof v === "string" && v.length > 0) {
                        normalized[k] = [v];
                    } else {
                        normalized[k] = undefined;
                    }
                    continue;
                }
                normalized[k] = v;
            }
            const parsed = StripSchema.safeParse(normalized);
            if (!parsed.success) {
                const messages = parsed.error.issues.map(i => `${i.path.join('.') || 'field'}: ${i.message}`);
                messages.forEach(m => toast.error(m));
                toast.error("Validation failed");
                return;
            }
            const body = parsed.data as T;

            const ssid = (theme?.ssid as string | undefined) || (body as Record<string, unknown>).ssid as string | undefined;
            if (!ssid) {
                toast.error("Missing SSID context");
                return;
            }
            // Always send multipart/form-data with a required 'json' part to match backend
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

            // Build JSON part ensuring fields with selected files are set to their slug key names for consistency
            const jsonPayload: Record<string, unknown> = { ...(body as Record<string, unknown>) };
            for (const f of Object.keys(selectedFiles)) {
                jsonPayload[f] = f; // brand_config.<field> must match its field/slug name
            }
            // ssid comes from query param in the API spec; keep body free of it (server reads query)
            delete jsonPayload.ssid;

            const form = new FormData();
            form.append("json", JSON.stringify(jsonPayload));
            for (const [field, file] of Object.entries(selectedFiles)) {
                form.append(field, file);
            }

            // Use fetch for multipart, leveraging hotspotAPI base URL for consistency
            const baseUrl = (hotspotAPI as unknown as { defaults?: { baseURL?: string } }).defaults?.baseURL || (hotspotAPI as unknown as { baseURL?: string }).baseURL || "";
            const url = `${baseUrl}/api/image?ssid=${encodeURIComponent(ssid)}`.replace(/([^:]\/)\/+/g, "$1/");
            const resp = await fetch(url, { method: "POST", body: form });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(text || `Upload failed with status ${resp.status}`);
            }
            const json = (await resp.json()) as { res: BrandingConfig };
            const updated: BrandingConfig | null = json.res;
            if (updated) {
                setTheme(updated);
                toast.success("Branding updated");
                await refreshTheme();
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
    }, [StripSchema, theme, selectedFiles, setTheme, refreshTheme, allowedMime, maxBytes]);

    const uploadImage = useCallback(async (field: string) => {
        const file = selectedFiles[field];
        if (!file) {
            toast.error(`Select a ${field} file first`);
            return;
        }
        if (!allowedMime.has(file.type)) {
            toast.error(`${field}: Unsupported file type`);
            return;
        }
        if (file.size > maxBytes) {
            toast.error(`${field}: File exceeds 20MB limit`);
            return;
        }
        const ssid = theme?.ssid as string | undefined;
        if (!ssid) {
            toast.error("Missing SSID context");
            return;
        }
        setUploadingByField(prev => ({ ...prev, [field]: true }));
        const start = performance.now();
        try {
            const form = new FormData();
            // Backend requires 'json' part; include the field set to its slug to enforce consistency
            form.append("json", JSON.stringify({ [field]: field }));
            form.append(field, file);

            const baseUrl = (hotspotAPI as unknown as { defaults?: { baseURL?: string } }).defaults?.baseURL || (hotspotAPI as unknown as { baseURL?: string }).baseURL || "";
            const url = `${baseUrl}/api/image?ssid=${encodeURIComponent(ssid)}`.replace(/([^:]\/)\/+/, "$1/");
            const resp = await fetch(url, { method: "POST", body: form });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(text || `Upload failed with status ${resp.status}`);
            }
            const json = (await resp.json()) as { res: BrandingConfig };
            const updated: BrandingConfig | null = json.res;
            if (updated) {
                setTheme(updated);
                toast.success(`${field} updated`);
                await refreshTheme();
                // Clear just this field's selection and preview URL
                setSelectedFiles(prev => {
                    const next = { ...prev };
                    delete next[field];
                    return next;
                });
                if (objectUrlsRef.current[field]) {
                    URL.revokeObjectURL(objectUrlsRef.current[field]);
                    delete objectUrlsRef.current[field];
                }
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : `Upload failed for ${field}`;
            console.error(`[BrandConfig] Upload error [${field}]`, e);
            toast.error(msg);
        } finally {
            setUploadingByField(prev => ({ ...prev, [field]: false }));
            console.log(`[BrandConfig] Upload(${field}) completed in ${(performance.now() - start).toFixed(0)}ms`);
        }
    }, [selectedFiles, theme?.ssid, refreshTheme, setTheme, allowedMime, maxBytes]);

    return {
        submitting,
        initialValues,
        selectedFiles,
        objectUrlsRef,
        handleFileChange,
        uploadingByField,
        uploadImage,
        onSubmit,
    } as const;
}

export default useBrandConfigForm;
