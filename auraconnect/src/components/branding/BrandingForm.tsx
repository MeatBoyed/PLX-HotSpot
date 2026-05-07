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
import { ImageUploadField } from './ImageUploadField'
import { BrandingImageType } from '@/lib/infrastructure/api/types'
import type { BrandingConfig, UpdateBrandingInput } from '@/lib/types/branding.types'

const colorKeys = [
  'brandPrimary', 'brandPrimaryHover', 'brandSecondary', 'brandAccent',
  'textPrimary', 'textSecondary', 'textTertiary', 'textMuted',
  'surfaceCard', 'surfaceWhite', 'surfaceBorder',
  'buttonPrimary', 'buttonPrimaryHover', 'buttonPrimaryText',
  'buttonSecondary', 'buttonSecondaryHover', 'buttonSecondaryText',
] as const

const colorLabels: Record<string, string> = {
  brandPrimary: 'Brand Primary',
  brandPrimaryHover: 'Brand Primary Hover',
  brandSecondary: 'Brand Secondary',
  brandAccent: 'Brand Accent',
  textPrimary: 'Text Primary',
  textSecondary: 'Text Secondary',
  textTertiary: 'Text Tertiary',
  textMuted: 'Text Muted',
  surfaceCard: 'Surface Card',
  surfaceWhite: 'Surface White',
  surfaceBorder: 'Surface Border',
  buttonPrimary: 'Button Primary',
  buttonPrimaryHover: 'Button Primary Hover',
  buttonPrimaryText: 'Button Primary Text',
  buttonSecondary: 'Button Secondary',
  buttonSecondaryHover: 'Button Secondary Hover',
  buttonSecondaryText: 'Button Secondary Text',
}

const optStr = z.string().nullable().optional()

const schema = z.object({
  brandPrimary: optStr, brandPrimaryHover: optStr, brandSecondary: optStr, brandAccent: optStr,
  textPrimary: optStr, textSecondary: optStr, textTertiary: optStr, textMuted: optStr,
  surfaceCard: optStr, surfaceWhite: optStr, surfaceBorder: optStr,
  buttonPrimary: optStr, buttonPrimaryHover: optStr, buttonPrimaryText: optStr,
  buttonSecondary: optStr, buttonSecondaryHover: optStr, buttonSecondaryText: optStr,
  logoUrl: optStr, logoWhiteUrl: optStr, connectCardBgUrl: optStr,
  bannerOverlayUrl: optStr, faviconUrl: optStr, splashBgUrl: optStr,
  displayName: optStr, heading: optStr, subheading: optStr, splashHeading: optStr,
  buttonText: optStr, termsLinks: optStr, venueLabel: optStr, venueRoute: optStr,
  sortOrder: z.number().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

interface BrandingFormProps {
  siteId: string
  config: BrandingConfig
  onSave: (values: UpdateBrandingInput) => Promise<void>
}

export function BrandingForm({ siteId, config, onSave }: BrandingFormProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm<FormValues>({
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
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
                    )}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {[
                { name: 'displayName' as const, label: 'Display Name' },
                { name: 'heading' as const, label: 'Heading' },
                { name: 'subheading' as const, label: 'Subheading' },
                { name: 'splashHeading' as const, label: 'Splash Heading' },
                { name: 'buttonText' as const, label: 'Connect Button Text' },
                { name: 'termsLinks' as const, label: 'Terms & Conditions Text' },
              ].map(({ name, label }) => (
                <div key={name} className="space-y-1.5">
                  <Label htmlFor={name} className="text-xs">{label}</Label>
                  <Input id={name} {...register(name)} />
                  {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message}</p>}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="images" className="space-y-6">
              {(
                [
                  { name: 'logoUrl' as const, label: 'Logo', imageType: BrandingImageType.Logo },
                  { name: 'logoWhiteUrl' as const, label: 'Logo (White)', imageType: BrandingImageType.LogoWhite },
                  { name: 'faviconUrl' as const, label: 'Favicon', imageType: BrandingImageType.Favicon },
                  { name: 'connectCardBgUrl' as const, label: 'Connect Card Background', imageType: BrandingImageType.ConnectCardBg },
                  { name: 'bannerOverlayUrl' as const, label: 'Banner Overlay', imageType: BrandingImageType.BannerOverlay },
                  { name: 'splashBgUrl' as const, label: 'Splash Background', imageType: BrandingImageType.SplashBg },
                ] as const
              ).map(({ name, label, imageType }) => (
                <ImageUploadField
                  key={name}
                  siteId={siteId}
                  imageType={imageType}
                  label={label}
                  currentUrl={watch(name)}
                  onUploaded={(url) => setValue(name, url)}
                />
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
              onClick={() => reset({ siteId: config.siteId } as FormValues)}
            >
              Reset
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
