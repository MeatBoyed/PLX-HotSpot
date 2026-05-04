'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColorField } from './ColorField'
import { BrandingPreview } from './BrandingPreview'
import { DEFAULT_BRANDING } from '@/lib/types/branding.types'
import type { BrandingConfig, UpdateBrandingInput } from '@/lib/types/branding.types'

const colorKeys = [
  'primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'surfaceColor',
  'textPrimaryColor', 'textSecondaryColor', 'buttonTextColor', 'buttonHoverColor',
  'linkColor', 'borderColor', 'errorColor', 'successColor', 'warningColor',
  'headerBgColor', 'footerBgColor', 'inputBgColor',
] as const

const colorLabels: Record<string, string> = {
  primaryColor: 'Primary',
  secondaryColor: 'Secondary',
  accentColor: 'Accent',
  backgroundColor: 'Background',
  surfaceColor: 'Surface',
  textPrimaryColor: 'Text Primary',
  textSecondaryColor: 'Text Secondary',
  buttonTextColor: 'Button Text',
  buttonHoverColor: 'Button Hover',
  linkColor: 'Link',
  borderColor: 'Border',
  errorColor: 'Error',
  successColor: 'Success',
  warningColor: 'Warning',
  headerBgColor: 'Header BG',
  footerBgColor: 'Footer BG',
  inputBgColor: 'Input BG',
}

const schema = z.object({
  primaryColor: z.string(), secondaryColor: z.string(), accentColor: z.string(),
  backgroundColor: z.string(), surfaceColor: z.string(), textPrimaryColor: z.string(),
  textSecondaryColor: z.string(), buttonTextColor: z.string(), buttonHoverColor: z.string(),
  linkColor: z.string(), borderColor: z.string(), errorColor: z.string(),
  successColor: z.string(), warningColor: z.string(), headerBgColor: z.string(),
  footerBgColor: z.string(), inputBgColor: z.string(),
  logoUrl: z.string(), backgroundImageUrl: z.string().optional(), faviconUrl: z.string().optional(),
  headingText: z.string().min(1), subheadingText: z.string(), connectButtonText: z.string().min(1),
  termsText: z.string(), termsUrl: z.string().optional(), privacyUrl: z.string().optional(),
  footerText: z.string().optional(), venueLabel: z.string(), venueRoute: z.string(),
})

type FormValues = z.infer<typeof schema>

interface BrandingFormProps {
  config: BrandingConfig
  onSave: (values: UpdateBrandingInput) => Promise<void>
}

export function BrandingForm({ config, onSave }: BrandingFormProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...config },
  })

  const currentValues = watch()

  const handleSave = async (values: FormValues) => {
    setLoading(true)
    try {
      await onSave(values)
      toast.success('Branding saved successfully')
    } catch {
      toast.error('Failed to save branding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div>
          <Tabs defaultValue="colors">
            <TabsList className="mb-4">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="venue">Venue</TabsTrigger>
            </TabsList>

            <TabsContent value="colors">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {colorKeys.map((key) => (
                  <Controller
                    key={key}
                    name={key}
                    control={control}
                    render={({ field }) => (
                      <ColorField
                        label={colorLabels[key]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {[
                { name: 'headingText' as const, label: 'Heading' },
                { name: 'subheadingText' as const, label: 'Subheading' },
                { name: 'connectButtonText' as const, label: 'Connect Button Text' },
                { name: 'termsText' as const, label: 'Terms Text' },
                { name: 'termsUrl' as const, label: 'Terms URL' },
                { name: 'privacyUrl' as const, label: 'Privacy URL' },
                { name: 'footerText' as const, label: 'Footer Text' },
              ].map(({ name, label }) => (
                <div key={name} className="space-y-1.5">
                  <Label htmlFor={name} className="text-xs">{label}</Label>
                  <Input id={name} {...register(name)} />
                  {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message}</p>}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              {[
                { name: 'logoUrl' as const, label: 'Logo URL' },
                { name: 'backgroundImageUrl' as const, label: 'Background Image URL' },
                { name: 'faviconUrl' as const, label: 'Favicon URL' },
              ].map(({ name, label }) => (
                <div key={name} className="space-y-1.5">
                  <Label htmlFor={name} className="text-xs">{label}</Label>
                  <Input id={name} {...register(name)} placeholder="https://..." />
                  {watch(name) && (
                    <img src={watch(name)} alt={label} className="h-12 object-contain rounded border" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="venue" className="space-y-4">
              {[
                { name: 'venueLabel' as const, label: 'Venue Label' },
                { name: 'venueRoute' as const, label: 'Venue Route' },
              ].map(({ name, label }) => (
                <div key={name} className="space-y-1.5">
                  <Label htmlFor={name} className="text-xs">{label}</Label>
                  <Input id={name} {...register(name)} />
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save Branding'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset({ ...DEFAULT_BRANDING })}
            >
              Reset to Default
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Live Preview</p>
          <BrandingPreview config={currentValues} />
        </div>
      </div>
    </form>
  )
}
