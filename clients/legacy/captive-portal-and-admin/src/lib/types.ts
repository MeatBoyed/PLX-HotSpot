import z from "zod";
import { schemas } from "./hotspotAPI"

export interface VastAdData {
    mediaFileUrl: string;
    clickThroughUrl?: string;
    impressionUrls: string[];
    duration?: number;
    title?: string;
    adId?: string;
    trackingEvents?: Record<string, string[]>;
}

export type BrandingConfig = z.infer<typeof schemas.BrandingConfig>
export type BrandingConfigUpdateBody = z.infer<typeof schemas.BrandingConfigUpdateBody>

// Form field configuration type
export type FormFieldConfig = {
    name: string;
    label: string;
    type: "text" | "email" | "number" | "textarea" | "select" | "multiselect" | "checkbox" | "radio" | "time" | "color" | "hidden";
    placeholder?: string;
    description?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    step?: string;
    min?: number;
    max?: number;
};

// Form section configuration
export type FormSectionConfig = {
    title: string;
    description: string;
    fields: FormFieldConfig[];
};