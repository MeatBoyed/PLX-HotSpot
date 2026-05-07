'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdsConfig, UpdateAdsConfigInput } from '@/lib/types/ads.types'

const optUrl = z
  .string()
  .nullable()
  .optional()
  .refine((v) => !v || v.startsWith('http://') || v.startsWith('https://'), {
    message: 'Must be a full URL including https://',
  })

const optStr = z.string().nullable().optional()

const schema = z.object({
  isEnabled: z.boolean().nullable().optional(),
  reviveServerUrl: optUrl,
  reviveZoneId: optStr,
  reviveId: optStr,
  vastUrl: optUrl,
})

type FormValues = z.infer<typeof schema>

interface AdsConfigFormProps {
  config: AdsConfig
  onSave: (values: UpdateAdsConfigInput) => Promise<void>
}

export function AdsConfigForm({ config, onSave }: AdsConfigFormProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...config },
  })

  const isEnabled = watch('isEnabled')

  const handleSave = async (values: FormValues) => {
    setLoading(true)
    try {
      // Coerce empty strings to null so the API doesn't receive "" for optional URL fields
      const cleaned: typeof values = {
        ...values,
        reviveServerUrl: values.reviveServerUrl || null,
        vastUrl: values.vastUrl || null,
      }
      await onSave(cleaned)
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
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Enable Ads</Label>
              <p className="text-sm text-muted-foreground">Show ads to users on the captive portal</p>
            </div>
            <Switch
              checked={isEnabled ?? false}
              onCheckedChange={(v) => setValue('isEnabled', v)}
            />
          </div>
        </CardContent>
      </Card>

      {isEnabled && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Revive Ad Server</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="space-y-2">
                <Label>Server URL</Label>
                <Input
                  {...register('reviveServerUrl')}
                  placeholder="https://ads.example.com/revive"
                  className="font-mono text-sm"
                />
                {errors.reviveServerUrl ? (
                  <p className="text-xs text-destructive">{errors.reviveServerUrl.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Full URL required, e.g. https://ads.example.com</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zone ID</Label>
                  <Input
                    {...register('reviveZoneId')}
                    placeholder="1"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Revive ID</Label>
                  <Input
                    {...register('reviveId')}
                    placeholder="abc123"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">VAST Video Ads</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="space-y-2">
                <Label>VAST URL</Label>
                <Input
                  {...register('vastUrl')}
                  placeholder="https://ads.example.com/vast.xml"
                  className="font-mono text-sm"
                />
                {errors.vastUrl ? (
                  <p className="text-xs text-destructive">{errors.vastUrl.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Full URL required, e.g. https://ads.example.com/vast.xml — VAST 2.0/3.0 compliant ad tag
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Save Configuration'}
      </Button>
    </form>
  )
}
