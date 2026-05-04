'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import type { AdsConfig, UpdateAdsConfigInput } from '@/lib/types/ads.types'

const schema = z.object({
  enabled: z.boolean(),
  provider: z.enum(['google', 'revuve', 'custom', 'none']),
  displayMode: z.enum(['banner', 'interstitial', 'both']),
  googleAdClientId: z.string().optional(),
  googleAdSlotId: z.string().optional(),
  revuvePublisherId: z.string().optional(),
  customAdScript: z.string().optional(),
  adDurationSeconds: z.number({ error: 'Required' }).min(5),
  skipAfterSeconds: z.number().optional(),
})

type FormValues = z.infer<typeof schema>

interface AdsConfigFormProps {
  config: AdsConfig
  onSave: (values: UpdateAdsConfigInput) => Promise<void>
}

export function AdsConfigForm({ config, onSave }: AdsConfigFormProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...config },
  })

  const provider = watch('provider')
  const enabled = watch('enabled')

  const handleSave = async (values: FormValues) => {
    setLoading(true)
    try {
      await onSave(values)
      toast.success('Ads configuration saved')
    } catch {
      toast.error('Failed to save ads configuration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-6 max-w-xl">
      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Enable Ads</Label>
              <p className="text-sm text-muted-foreground">Show ads to users on the captive portal</p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(v) => setValue('enabled', v)}
            />
          </div>

          {enabled && (
            <>
              <div className="space-y-2">
                <Label>Ad Provider</Label>
                <Select value={watch('provider')} onValueChange={(v) => setValue('provider', v as AdsConfig['provider'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="google">Google Ads</SelectItem>
                    <SelectItem value="revuve">Revuve</SelectItem>
                    <SelectItem value="custom">Custom Script</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Display Mode</Label>
                <Select value={watch('displayMode')} onValueChange={(v) => setValue('displayMode', v as AdsConfig['displayMode'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="interstitial">Interstitial</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {provider === 'google' && (
                <>
                  <div className="space-y-2">
                    <Label>Google Ad Client ID</Label>
                    <Input {...register('googleAdClientId')} placeholder="ca-pub-0000000000000000" className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Ad Slot ID</Label>
                    <Input {...register('googleAdSlotId')} placeholder="0000000000" className="font-mono" />
                  </div>
                </>
              )}

              {provider === 'revuve' && (
                <div className="space-y-2">
                  <Label>Revuve Publisher ID</Label>
                  <Input {...register('revuvePublisherId')} placeholder="pub_000000" className="font-mono" />
                </div>
              )}

              {provider === 'custom' && (
                <div className="space-y-2">
                  <Label>Custom Ad Script</Label>
                  <textarea
                    {...register('customAdScript')}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs min-h-[100px] resize-y"
                    placeholder="<script>...</script>"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ad Duration (seconds)</Label>
                  <Input type="number" {...register('adDurationSeconds', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Skip After (seconds)</Label>
                  <Input type="number" {...register('skipAfterSeconds', { valueAsNumber: true })} placeholder="Optional" />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Save Configuration'}
      </Button>
    </form>
  )
}
