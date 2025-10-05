"use client";

import React from "react";

export interface ImageFieldProps {
    name: string;
    label: string;
    value: unknown;
    onFile: (field: string, file: File | undefined) => void;
    previewUrls: Record<string, string>;
    readOnlyPath?: boolean;
    onUpload?: (field: string) => void;
    uploading?: boolean;
    ssid?: string;
}

// const ImageField: React.FC<ImageFieldProps> = ({ name, label, value, onFile, previewUrls, readOnlyPath }) => {
function ImageField({ name, label, value, onFile, previewUrls, readOnlyPath, onUpload, uploading, ssid }: ImageFieldProps) {
    const currentPath = typeof value === 'string' ? value : '';
    // If a local selection exists, prefer its object URL. Otherwise, use our first-party API with slug=name when ssid is available.
    const apiUrl = ssid ? `/api/image/${encodeURIComponent(name)}?ssid=${encodeURIComponent(ssid)}` : '';
    const preview = previewUrls[name] || (apiUrl || (currentPath ? (currentPath.startsWith('http') ? currentPath : currentPath) : ''));
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
                    {onUpload && (
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded border px-2 py-1 text-xs disabled:opacity-50"
                            onClick={() => onUpload(name)}
                            disabled={uploading}
                        >
                            {uploading ? "Uploading…" : "Upload"}
                        </button>
                    )}
                    <p className="text-[10px] text-muted-foreground">PNG, JPEG, WEBP up to 20MB. Selecting a file will replace existing image after save.</p>
                </div>
            </div>
        </div>
    );
};

export default ImageField;
