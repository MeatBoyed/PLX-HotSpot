'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateRadiusConfigAction } from '@/lib/actions/radius.actions'
import type { RadiusConfig } from '@/lib/types/radius.types'

const optUrl = z
  .string()
  .nullable()
  .optional()
  .refine((v) => !v || v.startsWith('http://') || v.startsWith('https://'), {
    message: 'Must be a full URL including https://',
  })

const optStr = z.string().nullable().optional()

const schema = z.object({
  gatewayUrl: optUrl,
  freeUsername: optStr,
  freePassword: optStr,
  radiusDeskUrl: optUrl,
  radiusDeskApiToken: optStr,
  radiusDeskRealmId: optStr,
  radiusDeskCloudId: optStr,
})

type FormValues = z.infer<typeof schema>

export function RadiusFormClient({ siteId, config }: { siteId: string; config: RadiusConfig }) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...config },
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const cleaned: typeof values = {
        ...values,
        gatewayUrl: values.gatewayUrl || null,
        radiusDeskUrl: values.radiusDeskUrl || null,
      }
      await updateRadiusConfigAction(siteId, cleaned)
      toast.success('RADIUS configuration saved')
    } catch {
      toast.error('Failed to save RADIUS configuration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Gateway</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <div className="space-y-2">
            <Label>Gateway URL</Label>
            <Input
              {...register('gatewayUrl')}
              placeholder="https://gateway.example.com"
              className="font-mono text-sm"
            />
            {errors.gatewayUrl ? (
              <p className="text-xs text-destructive">{errors.gatewayUrl.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Full URL required, e.g. https://gateway.example.com</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Free Username</Label>
              <Input {...register('freeUsername')} placeholder="free" className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Free Password</Label>
              <Input type="password" {...register('freePassword')} placeholder="••••••••" className="font-mono text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">RadiusDesk Integration</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <div className="space-y-2">
            <Label>RadiusDesk URL</Label>
            <Input
              {...register('radiusDeskUrl')}
              placeholder="https://radiusdesk.example.com"
              className="font-mono text-sm"
            />
            {errors.radiusDeskUrl ? (
              <p className="text-xs text-destructive">{errors.radiusDeskUrl.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Full URL required, e.g. https://radiusdesk.example.com</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>API Token</Label>
            <Input type="password" {...register('radiusDeskApiToken')} placeholder="••••••••" className="font-mono text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Realm ID</Label>
              <Input {...register('radiusDeskRealmId')} placeholder="realm-id" className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Cloud ID</Label>
              <Input {...register('radiusDeskCloudId')} placeholder="cloud-id" className="font-mono text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Save Configuration'}
      </Button>
    </form>
  )
}
