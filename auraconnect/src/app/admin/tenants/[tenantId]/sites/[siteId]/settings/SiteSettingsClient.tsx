'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Settings2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { updateSiteAction } from '@/lib/actions/sites.actions'
import type { Site } from '@/lib/types/site.types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  ssid: z.string().min(1, 'SSID is required'),
  domain: z.string().nullable().optional(),
  sortOrder: z.number().min(0),
  marketingOptIn: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  site: Site
}

export function SiteSettingsClient({ site }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: site.name,
      ssid: site.ssid,
      domain: site.domain ?? '',
      sortOrder: site.sortOrder ?? 0,
      marketingOptIn: site.marketingOptIn,
    },
  })

  const ssid = watch('ssid')
  const marketingOptIn = watch('marketingOptIn')

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    try {
      await updateSiteAction(site.id, {
        name: values.name,
        ssid: values.ssid,
        domain: values.domain || null,
        sortOrder: values.sortOrder,
        marketingOptIn: values.marketingOptIn,
      })
      toast.success('Site settings saved')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save site settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription className="mt-1">Identity, network, and feature configuration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Name */}
            <div className="space-y-2">
              <Label>Site Name *</Label>
              <Input {...register('name')} placeholder="e.g. Main Hall" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* SSID */}
            <div className="space-y-2">
              <Label>SSID *</Label>
              <Input {...register('ssid')} placeholder="e.g. venue-guest" className="font-mono" />
              {errors.ssid && <p className="text-xs text-destructive">{errors.ssid.message}</p>}
              <p className="text-xs text-muted-foreground">The Wi-Fi network name broadcast by this hotspot</p>
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Domain</Label>
                {ssid.trim() && (
                  <button
                    type="button"
                    onClick={() => setValue('domain', `${ssid.trim().toLowerCase()}.auraconnect.co.za`, { shouldDirty: true })}
                    className="text-xs text-primary hover:underline"
                  >
                    Auto-fill from SSID
                  </button>
                )}
              </div>
              <Input {...register('domain')} placeholder="e.g. portal.venue.co.za" className="font-mono" />
              <p className="text-xs text-muted-foreground">Optional custom domain for the captive portal</p>
            </div>

            {/* Sort Order */}
            <div className="space-y-2 w-32">
              <Label>Sort Order</Label>
              <Input type="number" min="0" {...register('sortOrder', { valueAsNumber: true })} />
            </div>

            <Separator />

            {/* Marketing Opt-in */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-toggle" className="text-sm font-medium cursor-pointer">
                  Marketing Opt-in
                </Label>
                <p className="text-xs text-muted-foreground">
                  {marketingOptIn
                    ? 'Users will see an opt-in checkbox during registration'
                    : 'Opt-in checkbox is hidden — no marketing data is collected'}
                </p>
              </div>
              <Controller
                control={control}
                name="marketingOptIn"
                render={({ field }) => (
                  <Switch
                    id="marketing-toggle"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving || !isDirty}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
