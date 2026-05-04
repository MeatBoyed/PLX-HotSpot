'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { updateRadiusConfigAction } from '@/lib/actions/radius.actions'
import type { RadiusConfig } from '@/lib/types/radius.types'

const schema = z.object({
  serverHost: z.string().min(1, 'Server host is required'),
  authPort: z.number({ error: 'Required' }).min(1).max(65535),
  acctPort: z.number({ error: 'Required' }).min(1).max(65535),
  secret: z.string().min(1, 'Shared secret is required'),
  timeout: z.number({ error: 'Required' }).min(1).max(30),
  retries: z.number({ error: 'Required' }).min(1).max(10),
  nasIdentifier: z.string().min(1, 'NAS identifier is required'),
  nasIpAddress: z.string().optional(),
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
      await updateRadiusConfigAction(siteId, values)
      toast.success('RADIUS configuration saved')
    } catch {
      toast.error('Failed to save configuration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-sm">Server Settings</h3>
          <div className="space-y-2">
            <Label>Server Host *</Label>
            <Input {...register('serverHost')} placeholder="192.168.1.100" className="font-mono" />
            {errors.serverHost && <p className="text-xs text-destructive">{errors.serverHost.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Auth Port</Label>
              <Input type="number" {...register('authPort', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Accounting Port</Label>
              <Input type="number" {...register('acctPort', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Shared Secret *</Label>
            <Input type="password" {...register('secret')} placeholder="••••••••" className="font-mono" />
            {errors.secret && <p className="text-xs text-destructive">{errors.secret.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-sm">NAS Settings</h3>
          <div className="space-y-2">
            <Label>NAS Identifier *</Label>
            <Input {...register('nasIdentifier')} placeholder="venue-ap-01" className="font-mono" />
            {errors.nasIdentifier && <p className="text-xs text-destructive">{errors.nasIdentifier.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>NAS IP Address</Label>
            <Input {...register('nasIpAddress')} placeholder="10.0.0.1" className="font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Timeout (seconds)</Label>
              <Input type="number" {...register('timeout', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Retries</Label>
              <Input type="number" {...register('retries', { valueAsNumber: true })} />
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
