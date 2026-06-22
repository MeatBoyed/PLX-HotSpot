'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { SecretInput } from '@/components/common/SecretInput'
import { MikroTikSettingsCard } from './MikroTikSettingsCard'
import { updatePayFastSettingsAction } from '@/lib/actions/platform.actions'
import type { PlatformSettings } from '@/lib/infrastructure/api/platform.api'
import { formatDateTime } from '@/lib/utils/formatters'

const payfastSchema = z.object({
  merchantId: z.string().min(1, 'Merchant ID is required'),
  merchantKey: z.string().optional().or(z.literal('')),
  passPhrase: z.string().nullable().optional(),
  sandboxMode: z.boolean(),
})

type PayFastFormValues = z.infer<typeof payfastSchema>

interface Props {
  settings: PlatformSettings | null
}

export function SettingsClient({ settings }: Props) {
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PayFastFormValues>({
    resolver: zodResolver(payfastSchema),
    defaultValues: {
      merchantId: settings?.payFastMerchantId ?? '',
      merchantKey: '',
      passPhrase: '',
      sandboxMode: settings?.payFastSandboxMode ?? true,
    },
  })

  const sandboxMode = watch('sandboxMode')

  const onSubmit = async (values: PayFastFormValues) => {
    setSaving(true)
    try {
      await updatePayFastSettingsAction({
        merchantId: values.merchantId,
        merchantKey: values.merchantKey || undefined,
        passPhrase: values.passPhrase || null,
        sandboxMode: values.sandboxMode,
      })
      toast.success('PayFast settings updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update PayFast settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>PayFast Integration</CardTitle>
                <CardDescription className="mt-1">
                  Payment gateway credentials for wallet top-ups
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {settings?.isPayFastConfigured
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
              <Label>Merchant ID *</Label>
              <Input
                {...register('merchantId')}
                placeholder="10000100"
                className="font-mono"
              />
              {errors.merchantId && <p className="text-xs text-destructive">{errors.merchantId.message}</p>}
              <p className="text-xs text-muted-foreground">Your PayFast merchant identifier</p>
            </div>

            <SecretInput<PayFastFormValues>
              label="Merchant Key *"
              isSet={settings?.isPayFastMerchantKeySet ?? false}
              placeholder="46f0cd694581a"
              name="merchantKey"
              register={register}
            />

            <SecretInput<PayFastFormValues>
              label="Passphrase"
              isSet={settings?.isPayFastPassPhraseSet ?? false}
              placeholder="Optional security passphrase"
              name="passPhrase"
              register={register}
            />

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Sandbox Mode</Label>
                <p className="text-xs text-muted-foreground">
                  {sandboxMode
                    ? 'Sandbox enabled — no real payments will be processed'
                    : 'Live mode — real payments will be processed'}
                </p>
              </div>
              <Switch
                checked={sandboxMode}
                onCheckedChange={(checked) => setValue('sandboxMode', checked)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <MikroTikSettingsCard settings={settings} />
    </div>
  )
}
