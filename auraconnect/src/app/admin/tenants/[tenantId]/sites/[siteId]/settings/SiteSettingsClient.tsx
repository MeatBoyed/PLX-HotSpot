'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Settings2, X, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { updateSiteAction } from '@/lib/actions/sites.actions'
import type { Site } from '@/lib/types/site.types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  ssid: z.string().min(1, 'SSID is required'),
  domain: z.string().min(1, 'Domain is required'),
  sortOrder: z.number().min(0),
  marketingOptIn: z.boolean(),
  radiusCalledStationIds: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

interface Props {
  site: Site
}

export function SiteSettingsClient({ site }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: site.name,
      ssid: site.ssid,
      domain: site.domain,
      sortOrder: site.sortOrder ?? 0,
      marketingOptIn: site.marketingOptIn,
      radiusCalledStationIds: site.radiusCalledStationIds,
    },
  })

  const stationIds = watch('radiusCalledStationIds')

  function addStationId() {
    const val = tagInputRef.current?.value.trim()
    if (!val || stationIds.includes(val)) return
    setValue('radiusCalledStationIds', [...stationIds, val], { shouldDirty: true })
    if (tagInputRef.current) tagInputRef.current.value = ''
  }

  function removeStationId(id: string) {
    setValue('radiusCalledStationIds', stationIds.filter((s) => s !== id), { shouldDirty: true })
  }

  function onTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addStationId() }
  }

  const ssid = watch('ssid')
  const marketingOptIn = watch('marketingOptIn')

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    try {
      await updateSiteAction(site.id, {
        name: values.name,
        ssid: values.ssid,
        domain: values.domain,
        sortOrder: values.sortOrder,
        marketingOptIn: values.marketingOptIn,
        radiusCalledStationIds: values.radiusCalledStationIds,
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
                <Label>Domain *</Label>
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
              {errors.domain && <p className="text-xs text-destructive">{errors.domain.message}</p>}
              <p className="text-xs text-muted-foreground">Required — the MikroTik gateway redirect can&apos;t function without it</p>
            </div>

            {/* RADIUS Called Station IDs */}
            <div className="space-y-2">
              <Label>RADIUS Called Station IDs</Label>
              <div className="flex gap-2">
                <Input
                  ref={tagInputRef}
                  placeholder="e.g. Cosmo Taxi Rank"
                  className="font-mono"
                  onKeyDown={onTagKeyDown}
                />
                <Button type="button" variant="outline" size="sm" onClick={addStationId}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {stationIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {stationIds.map((id) => (
                    <Badge key={id} variant="secondary" className="gap-1 font-mono text-xs">
                      {id}
                      <button type="button" onClick={() => removeStationId(id)} className="ml-0.5 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                RADIUS <code className="text-[11px] bg-muted px-1 rounded">calledstationid</code> aliases that identify this site in accounting data. Add one per field and press Enter.
              </p>
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
