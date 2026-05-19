'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { updatePayFastSettingsAction } from '@/lib/actions/platform.actions'

const payfastSchema = z.object({
  merchantId: z.string().min(1, 'Merchant ID is required'),
  merchantKey: z.string().min(1, 'Merchant Key is required'),
  passPhrase: z.string().nullable().optional(),
  sandboxMode: z.boolean(),
})

type PayFastFormValues = z.infer<typeof payfastSchema>

export function SettingsClient() {
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PayFastFormValues>({
    resolver: zodResolver(payfastSchema),
    defaultValues: {
      merchantId: '',
      merchantKey: '',
      passPhrase: '',
      sandboxMode: true,
    },
  })

  const sandboxMode = watch('sandboxMode')

  const onSubmit = async (values: PayFastFormValues) => {
    setSaving(true)
    try {
      await updatePayFastSettingsAction({
        merchantId: values.merchantId,
        merchantKey: values.merchantKey,
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
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>PayFast Integration</CardTitle>
          </div>
          <CardDescription>
            Configure PayFast payment gateway credentials. These are used for processing wallet top-ups.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Merchant ID *</Label>
              <Input {...register('merchantId')} placeholder="10000100" className="font-mono" />
              {errors.merchantId && <p className="text-xs text-destructive">{errors.merchantId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Merchant Key *</Label>
              <Input {...register('merchantKey')} placeholder="46f0cd694581a" className="font-mono" />
              {errors.merchantKey && <p className="text-xs text-destructive">{errors.merchantKey.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Passphrase</Label>
              <Input
                {...register('passPhrase')}
                type="password"
                placeholder="Optional security passphrase"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Leave blank if not set in your PayFast account</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Sandbox Mode</Label>
                <p className="text-xs text-muted-foreground">
                  {sandboxMode
                    ? 'Using PayFast sandbox — no real payments will be processed'
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
                {saving ? 'Saving…' : 'Save PayFast Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
