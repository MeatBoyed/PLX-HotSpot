"use client";

import React, { useState } from "react";
import { DefaultValues, FieldValues, SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FormFieldConfig, FormSectionConfig } from "@/lib/types";
import { z } from "zod";

type JsonRecord = Record<string, unknown>;

interface CustomFormProps<TValues extends FieldValues = FieldValues> {
    sections: FormSectionConfig[];
    schema: z.ZodType<TValues>;
    onSubmit: (data: TValues) => void;
    defaultValues?: Partial<TValues>;
    isSubmitting?: boolean;
    // Optional custom renderers keyed by field name
    fieldRenderers?: Record<string, (ctx: { field: FormFieldConfig; form: UseFormReturn<TValues>; value: unknown }) => React.ReactNode>;
}

interface FormFieldProps<TValues extends FieldValues = FieldValues> {
    field: FormFieldConfig;
    form: UseFormReturn<TValues>;
    watchedValues?: TValues;
}

function FormFieldComponent<TValues extends FieldValues>({ field, form, watchedValues }: FormFieldProps<TValues>) {
    const watchedValue = watchedValues?.[field.name];

    const renderField = () => {
        switch (field.type) {
            case "hidden":
                return (
                    <input type="hidden" {...form.register(field.name as never)} />
                );
            case "text":
            case "email":
                return (
                    <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        {...form.register(field.name as never)}
                    />
                );

            case "number":
                return (
                    <Input
                        type="number"
                        placeholder={field.placeholder}
                        step={field.step}
                        min={field.min}
                        max={field.max}
                        {...form.register(field.name as never, {
                            valueAsNumber: true,
                            setValueAs: (value) => value === "" ? undefined : Number(value)
                        })}
                    />
                );

            case "color":
                return (
                    <div className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder={field.placeholder}
                            className="w-32"
                            {...form.register(field.name as never)}
                        />
                        <input
                            type="color"
                            aria-label={field.label}
                            className="h-8 w-8 p-0 border rounded cursor-pointer"
                            value={typeof watchedValue === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(watchedValue) ? watchedValue : '#000000'}
                            onChange={(e) => form.setValue(field.name as never, e.target.value as never, { shouldValidate: true, shouldDirty: true })}
                        />
                    </div>
                );

            case "time":
                return (
                    <Input
                        type="time"
                        {...form.register(field.name as never)}
                    />
                );

            case "textarea":
                return (
                    <Textarea
                        placeholder={field.placeholder}
                        className="min-h-24"
                        {...form.register(field.name as never)}
                    />
                );

            case "select":
                return (
                    <>
                        {/* Register the field with RHF to ensure validation & form state */}
                        <input type="hidden" {...form.register(field.name as never)} />
                        <Select
                            onValueChange={(value) => form.setValue(field.name as never, value as never, { shouldValidate: true, shouldDirty: true })}
                            defaultValue={typeof watchedValue === 'string' ? watchedValue : undefined}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </>
                );

            case "multiselect":
                const selectedValues = (Array.isArray(watchedValue) ? watchedValue as string[] : []) || [];
                const rolesToContact = Array.isArray((watchedValues as JsonRecord)?.rolesToContact)
                    ? ((watchedValues as JsonRecord).rolesToContact as string[])
                    : [];
                const departments = Array.isArray((watchedValues as JsonRecord)?.departments)
                    ? ((watchedValues as JsonRecord).departments as string[])
                    : [];
                const availableOptions = field.name === "callOrder"
                    ? (field.options?.filter(opt => rolesToContact.includes(opt.value)) || [])
                    : field.name === "dailyCallDepartments"
                        ? (field.options?.filter(opt => departments.includes(opt.value)) || [])
                        : field.options || [];

                return (
                    <div className="space-y-3">
                        {/* Register array field so RHF tracks and validates */}
                        <input type="hidden" {...form.register(field.name as never)} />
                        {availableOptions.length === 0 && field.name !== "departments" && field.name !== "rolesToContact" && (
                            <p className="text-sm text-muted-foreground">
                                Please select {field.name === "callOrder" ? "roles to contact" : field.name === "dailyCallDepartments" ? "departments" : "options"} first.
                            </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(field.name === "departments" || field.name === "rolesToContact" ? field.options : availableOptions)?.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${field.name}-${option.value}`}
                                        checked={selectedValues.includes(option.value)}
                                        onCheckedChange={(checked) => {
                                            const currentValues = selectedValues;
                                            let newValues;

                                            if (checked) {
                                                newValues = [...currentValues, option.value];
                                            } else {
                                                newValues = currentValues.filter((v: string) => v !== option.value);

                                                // Clean up dependent fields
                                                if (field.name === "departments") {
                                                    const currentDailyCall = ((watchedValues as JsonRecord)?.dailyCallDepartments as string[] | undefined) || [];
                                                    form.setValue("dailyCallDepartments" as never, currentDailyCall.filter((v: string) => v !== option.value) as never);
                                                } else if (field.name === "rolesToContact") {
                                                    const currentCallOrder = ((watchedValues as JsonRecord)?.callOrder as string[] | undefined) || [];
                                                    const currentReportRecipients = ((watchedValues as JsonRecord)?.reportRecipients as string[] | undefined) || [];
                                                    form.setValue("callOrder" as never, currentCallOrder.filter((v: string) => v !== option.value) as never);
                                                    form.setValue("reportRecipients" as never, currentReportRecipients.filter((v: string) => v !== option.value) as never);
                                                }
                                            }

                                            form.setValue(field.name as never, newValues as never, { shouldValidate: true, shouldDirty: true });
                                        }}
                                    />
                                    <label
                                        htmlFor={`${field.name}-${option.value}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {selectedValues.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedValues.map((value: string) => {
                                    const option = field.options?.find(opt => opt.value === value);
                                    return option ? (
                                        <Badge key={value} variant="secondary">
                                            {option.label}
                                        </Badge>
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>
                );

            case "checkbox":
                return (
                    <div className="flex items-center space-x-2">
                        {/* Register boolean field */}
                        <input type="hidden" {...form.register(field.name as never)} />
                        <Checkbox
                            id={field.name}
                            checked={Boolean(watchedValue)}
                            onCheckedChange={(checked) => form.setValue(field.name as never, (checked === true) as never, { shouldValidate: true, shouldDirty: true })}
                        />
                        <label
                            htmlFor={field.name}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {field.label}
                        </label>
                    </div>
                );

            case "radio":
                return (
                    <div className="flex gap-6">
                        {/* Register radio field */}
                        <input type="hidden" {...form.register(field.name as never)} />
                        {field.options?.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id={`${field.name}-${option.value}`}
                                    value={option.value}
                                    checked={watchedValue === option.value}
                                    onChange={(e) => form.setValue(field.name as never, e.target.value as never, { shouldValidate: true, shouldDirty: true })}
                                    className="w-4 h-4"
                                />
                                <label
                                    htmlFor={`${field.name}-${option.value}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                );

            default:
                return <Input placeholder={field.placeholder} {...form.register(field.name as never)} />;
        }
    };

    if (field.type === "checkbox" || field.type === "hidden") {
        return (
            <FormField
                control={form.control}
                name={field.name as never}
                render={() => (
                    <FormItem className={field.type === "hidden" ? "hidden" : "flex flex-row items-start space-x-3 space-y-0"}>
                        <FormControl>
                            {renderField()}
                        </FormControl>
                        {field.type !== "hidden" && (
                            <>
                                <div className="space-y-1 leading-none">
                                    {field.description && (
                                        <FormDescription>{field.description}</FormDescription>
                                    )}
                                </div>
                                <FormMessage />
                            </>
                        )}
                    </FormItem>
                )}
            />
        );
    }

    return (
        <FormField
            control={form.control}
            name={field.name as never}
            render={() => (
                <FormItem className="space-y-2">
                    {field.type !== "checkbox" && (
                        <FormLabel>
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </FormLabel>
                    )}
                    <FormControl>
                        {renderField()}
                    </FormControl>
                    {field.description && (
                        <FormDescription>{field.description}</FormDescription>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export function CustomForm<TValues extends FieldValues>({ sections, schema, onSubmit, defaultValues, isSubmitting = false, fieldRenderers }: CustomFormProps<TValues>) {
    const [openSections, setOpenSections] = useState<Set<number>>(new Set([0])); // First section open by default

    const form = useForm<TValues>({
        // Type cast is required due to @hookform/resolvers types expecting Zod v3 while project uses Zod v4
        resolver: (zodResolver as unknown as (s: z.ZodType<TValues>) => unknown)(schema) as never,
        defaultValues: (defaultValues || {}) as DefaultValues<TValues>,
    });

    const watchedValues = form.watch();

    const toggleSection = (index: number) => {
        const newOpenSections = new Set(openSections);
        if (newOpenSections.has(index)) {
            newOpenSections.delete(index);
        } else {
            newOpenSections.add(index);
        }
        setOpenSections(newOpenSections);
    };

    const handleSubmit = (data: TValues) => {
        onSubmit(data);
    };

    const submitHandler: SubmitHandler<TValues> = (data) => handleSubmit(data);

    // Autofocus first invalid field when errors appear
    const firstErrorKey = Object.keys(form.formState.errors)[0];
    React.useEffect(() => {
        if (firstErrorKey) {
            // react-hook-form setFocus
            // @ts-ignore
            form.setFocus(firstErrorKey as any);
        }
    }, [firstErrorKey]);

    return (
        <Form {...(form as unknown as UseFormReturn<TValues>)}>
            <form onSubmit={form.handleSubmit(submitHandler as SubmitHandler<FieldValues>)} className="space-y-8">
                {/* Global error summary */}
                {Object.keys(form.formState.errors).length > 0 && (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm text-destructive">Validation Errors</CardTitle>
                            <CardDescription className="text-xs">Please fix the following fields:</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                            <ul className="list-disc list-inside text-xs space-y-1">
                                {Object.entries(form.formState.errors).map(([name, err]) => (
                                    <li key={name} className="break-all">
                                        <span className="font-medium">{name}</span>: {(err as unknown as { message?: string })?.message || "Invalid value"}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {sections.map((section, sectionIndex) => (
                    <Card key={sectionIndex}>
                        <Collapsible
                            open={openSections.has(sectionIndex)}
                            onOpenChange={() => toggleSection(sectionIndex)}
                        >
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{section.title}</CardTitle>
                                            <CardDescription>{section.description}</CardDescription>
                                        </div>
                                        {openSections.has(sectionIndex) ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        {section.fields.map((field, fieldIndex) => {
                                            const custom = fieldRenderers?.[field.name];
                                            const value = (watchedValues as any)?.[field.name];
                                            return (
                                                <div
                                                    key={fieldIndex}
                                                    className={(field.type === "textarea" || field.type === "multiselect") ? "md:col-span-2" : ""}
                                                >
                                                    {custom ? custom({ field, form: form as unknown as UseFormReturn<TValues>, value }) : (
                                                        <FormFieldComponent
                                                            field={field}
                                                            form={form as unknown as UseFormReturn<TValues>}
                                                            watchedValues={watchedValues as TValues}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                ))}

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="min-w-40 flex items-center justify-center gap-2">
                        {isSubmitting && (
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
                        )}
                        <span>{isSubmitting ? "Saving..." : "Save Configuration"}</span>
                    </Button>
                </div>
            </form>
        </Form>
    );
}