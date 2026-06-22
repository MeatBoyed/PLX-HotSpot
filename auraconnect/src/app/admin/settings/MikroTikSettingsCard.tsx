'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Router, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SecretInput } from '@/components/common/SecretInput'
import { updateMikroTikSettingsAction } from '@/lib/actions/platform.actions'
import type { PlatformSettings } from '@/lib/infrastructure/api/platform.api'
import { formatDateTime } from '@/lib/utils/formatters'

const mikrotikSchema = z.object({
  apiHost: z.string().min(1, 'API host is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional().or(z.literal('')),
})

type MikroTikFormValues = z.infer<typeof mikrotikSchema>

interface Props {
  settings: PlatformSettings | null
}

export function MikroTikSettingsCard({ settings }: Props) {
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<MikroTikFormValues>({
    resolver: zodResolver(mikrotikSchema),
    defaultValues: {
      apiHost: settings?.mikroTikApiHost ?? '',
      username: settings?.mikroTikUsername ?? '',
      password: '',
    },
  })

  const onSubmit = async (values: MikroTikFormValues) => {
    setSaving(true)
    try {
      await updateMikroTikSettingsAction({
        apiHost: values.apiHost,
        username: values.username,
        password: values.password || undefined,
      })
      toast.success('MikroTik settings updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update MikroTik settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Router className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>MikroTik Integration</CardTitle>
              <CardDescription className="mt-1">
                Router API credentials used for gateway provisioning and diagnostics
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {settings?.isMikroTikConfigured
              ? <Badge variant="outline" className="text-green-700 border-green-300 gap-1"><CheckCircle2 className="h-3 w-3" />Configured</Badge>
              : <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" />Not configured</Badge>
            }
            {settings?.updatedAt && (
              <p className="text-xs text-muted-foreground">Last updated {formatDateTime(settings.updatedAt)}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>API Host *</Label>
            <Input
              {...register('apiHost')}
              placeholder="gateway.pluxnet.co.za"
              className="font-mono"
            />
            {errors.apiHost && <p className="text-xs text-destructive">{errors.apiHost.message}</p>}
            <p className="text-xs text-muted-foreground">Hostname or IP of the MikroTik RouterOS API</p>
          </div>

          <div className="space-y-2">
            <Label>Username *</Label>
            <Input
              {...register('username')}
              placeholder="admin"
              className="font-mono"
            />
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>

          <SecretInput<MikroTikFormValues>
            label="Password"
            isSet={settings?.isMikroTikPasswordSet ?? false}
            placeholder="Router API password"
            name="password"
            register={register}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
