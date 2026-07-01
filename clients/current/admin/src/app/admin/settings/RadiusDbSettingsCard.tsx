'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Database, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SecretInput } from '@/components/common/SecretInput'
import { updateRadiusDbSettingsAction } from '@/lib/actions/platform.actions'
import type { PlatformSettings } from '@/lib/infrastructure/api/platform.api'
import { formatDateTime } from '@/lib/utils/formatters'

const schema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1).max(65535),
  databaseName: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface Props {
  settings: PlatformSettings | null
}

export function RadiusDbSettingsCard({ settings }: Props) {
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      host: settings?.radiusDbHost ?? '',
      port: settings?.radiusDbPort ?? 3306,
      databaseName: settings?.radiusDbName ?? '',
      username: settings?.radiusDbUsername ?? '',
      password: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    try {
      await updateRadiusDbSettingsAction({
        host: values.host,
        port: values.port,
        databaseName: values.databaseName,
        username: values.username,
        password: values.password || undefined,
      })
      toast.success('RADIUS DB settings updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update RADIUS DB settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>RADIUS DB Integration</CardTitle>
              <CardDescription className="mt-1">
                Read-only credentials for the RadiusDesk MariaDB — used for usage metrics and accounting data
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {settings?.isRadiusDbConfigured
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
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Host *</Label>
              <Input
                {...register('host')}
                placeholder="monitor.auraconnect.co.za"
                className="font-mono"
              />
              {errors.host && <p className="text-xs text-destructive">{errors.host.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Port *</Label>
              <Input
                type="number"
                {...register('port', { valueAsNumber: true })}
                placeholder="3306"
                className="font-mono"
              />
              {errors.port && <p className="text-xs text-destructive">{errors.port.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Database Name *</Label>
            <Input
              {...register('databaseName')}
              placeholder="rd"
              className="font-mono"
            />
            {errors.databaseName && <p className="text-xs text-destructive">{errors.databaseName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Username *</Label>
            <Input
              {...register('username')}
              placeholder="auraconnect_ro"
              className="font-mono"
            />
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            <p className="text-xs text-muted-foreground">Use a read-only database user</p>
          </div>

          <SecretInput<FormValues>
            label="Password"
            isSet={settings?.isRadiusDbPasswordSet ?? false}
            placeholder="Database password"
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
