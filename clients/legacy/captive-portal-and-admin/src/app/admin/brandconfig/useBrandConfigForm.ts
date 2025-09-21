"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
    const objectUrlsRef = useRef<Record<string, string>>({});

    const allowedMime = new Set(["image/png", "image/jpeg", "image/webp"]);
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
            const hasFiles = Object.keys(selectedFiles).length > 0;
            let updated: BrandingConfig | null = null;
            if (!hasFiles) {
                const response = await hotspotAPI.patchApiportalconfig(body as unknown as Record<string, unknown>, { queries: { ssid } });
                updated = (response as { res: BrandingConfig }).res;
            } else {
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
                // Build JSON part without any file path fields that are being replaced
                const jsonPayload: Record<string, unknown> = { ...(body as Record<string, unknown>) };
                for (const f of Object.keys(selectedFiles)) {
                    delete jsonPayload[f];
                }
                // ssid comes from query param in the API spec; keep body free of it (server reads query)
                delete jsonPayload.ssid;

                const form = new FormData();
                form.append("json", JSON.stringify(jsonPayload));
                for (const [field, file] of Object.entries(selectedFiles)) {
                    form.append(field, file);
                }

                // Use fetch for multipart since the typed client only defines JSON for this endpoint
                const baseUrl = (hotspotAPI as unknown as { defaults?: { baseURL?: string } }).defaults?.baseURL || (hotspotAPI as unknown as { baseURL?: string }).baseURL || "";
                const url = `${baseUrl}/api/portal/config?ssid=${encodeURIComponent(ssid)}`.replace(/([^:]\/)\/+/g, "$1/");
                const resp = await fetch(url, { method: "PATCH", body: form });
                if (!resp.ok) {
                    const text = await resp.text();
                    throw new Error(text || `Upload failed with status ${resp.status}`);
                }
                const json = (await resp.json()) as { res: BrandingConfig };
                updated = json.res;
            }
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
    }, [StripSchema, theme, selectedFiles, setTheme, refreshTheme]);

    return {
        submitting,
        initialValues,
        selectedFiles,
        objectUrlsRef,
        handleFileChange,
        onSubmit,
    } as const;
}

export default useBrandConfigForm;
