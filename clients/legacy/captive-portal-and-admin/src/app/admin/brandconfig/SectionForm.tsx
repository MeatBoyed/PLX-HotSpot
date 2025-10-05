"use client";

import React, { useState } from "react";
import type { FormFieldConfig, FormSectionConfig } from "@/lib/types";
import { CustomForm } from "@/components/ui/custom-form";
import type { BrandingConfig } from "@/lib/types";
import type { UseFormReturn } from "react-hook-form";

type FieldRenderers = Record<string, (ctx: { field: FormFieldConfig; form: UseFormReturn<Record<string, unknown>>; value: unknown }) => React.ReactNode>;

export type SectionFormProps = {
    title: string;
    description?: string;
    fields: FormFieldConfig[];
    schema: any; // Zod schema for validation (full object ok; we filter values before submit)
    defaultValues: Record<string, unknown>;
    ssid: string;
    // Server action that updates only this section
    action: (ssid: string, values: unknown) => Promise<BrandingConfig>;
    // Called after successful update to refresh UI/theme
    onUpdated: (updated: BrandingConfig) => Promise<void> | void;
    // Optional custom renderers for fields (e.g., images in Identity)
    fieldRenderers?: FieldRenderers;
};

export default function SectionForm({ title, description, fields, schema, defaultValues, ssid, action, onUpdated, fieldRenderers }: SectionFormProps) {
    const [submitting, setSubmitting] = useState(false);

    const sections: FormSectionConfig[] = [
        { title, description: description ?? "", fields },
    ];

    const fieldNames = new Set(fields.map(f => f.name));

    const onSubmit = async (values: Record<string, unknown>) => {
        setSubmitting(true);
        try {
            // Only pass through fields belonging to this section
            const sectionValues: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(values)) {
                if (fieldNames.has(k)) sectionValues[k] = v;
            }
            const updated = await action(ssid, sectionValues);
            await onUpdated(updated);
        } finally {
            setSubmitting(false);
        }
    };

    // Compose default values limited to the section fields
    const sectionDefaults: Record<string, unknown> = {};
    for (const f of fields) {
        if (f.name in defaultValues) sectionDefaults[f.name] = (defaultValues as any)[f.name];
    }

    return (
        <CustomForm
            sections={sections}
            schema={schema}
            defaultValues={sectionDefaults}
            onSubmit={onSubmit}
            isSubmitting={submitting}
            fieldRenderers={fieldRenderers}
        />
    );
}
