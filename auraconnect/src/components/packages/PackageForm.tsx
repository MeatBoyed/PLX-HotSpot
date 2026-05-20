'use client'

import { useForm, Controller, Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import type { Package, CreatePackageInput, UpdatePackageInput } from '@/lib/types/package.types'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().nullable().optional(),
  price: z.number({ error: 'Required' }).min(0, 'Price must be 0 or more'),
  radiusProfile: z.string().min(1, 'RADIUS profile is required'),
  sortOrder: z.number({ error: 'Required' }).min(0),
  durationDays: z.number().min(0),
  dataLimitEnabled: z.boolean(),
  dataAmount: z.number().nullable().optional(),
  dataUnit: z.string().nullable().optional(),
  dataReset: z.string().nullable().optional(),
  dataCap: z.string().nullable().optional(),
  timeLimitEnabled: z.boolean(),
  timeAmount: z.number().nullable().optional(),
  timeUnit: z.string().nullable().optional(),
  timeReset: z.string().nullable().optional(),
  timeCap: z.string().nullable().optional(),
  speedLimitEnabled: z.boolean(),
  speedUploadAmount: z.number().nullable().optional(),
  speedUploadUnit: z.string().nullable().optional(),
  speedDownloadAmount: z.number().nullable().optional(),
  speedDownloadUnit: z.string().nullable().optional(),
  sessionLimitEnabled: z.boolean(),
  sessionLimit: z.number().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

interface PackageFormProps {
  defaultValues?: Partial<Package>
  onSubmit: (values: CreatePackageInput | UpdatePackageInput) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

type LimitKey = 'dataLimitEnabled' | 'timeLimitEnabled' | 'speedLimitEnabled' | 'sessionLimitEnabled'

function LimitToggleRow({ label, name, control }: { label: string; name: LimitKey; control: Control<FormValues> }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          <Switch checked={!!field.value} onCheckedChange={field.onChange} />
        </div>
      )}
    />
  )
}

export function PackageForm({ defaultValues, onSubmit, onCancel, loading }: PackageFormProps) {
  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      price: defaultValues?.price ?? 0,
      radiusProfile: defaultValues?.radiusProfile ?? '',
      sortOrder: defaultValues?.sortOrder ?? 1,
      durationDays: defaultValues?.durationDays ?? 0,
      dataLimitEnabled: defaultValues?.dataLimitEnabled ?? false,
      dataAmount: defaultValues?.dataAmount ?? null,
      dataUnit: defaultValues?.dataUnit ?? 'MB',
      dataReset: defaultValues?.dataReset ?? null,
      dataCap: defaultValues?.dataCap ?? null,
      timeLimitEnabled: defaultValues?.timeLimitEnabled ?? false,
      timeAmount: defaultValues?.timeAmount ?? null,
      timeUnit: defaultValues?.timeUnit ?? 'minutes',
      timeReset: defaultValues?.timeReset ?? null,
      timeCap: defaultValues?.timeCap ?? null,
      speedLimitEnabled: defaultValues?.speedLimitEnabled ?? false,
      speedUploadAmount: defaultValues?.speedUploadAmount ?? null,
      speedUploadUnit: defaultValues?.speedUploadUnit ?? 'kbps',
      speedDownloadAmount: defaultValues?.speedDownloadAmount ?? null,
      speedDownloadUnit: defaultValues?.speedDownloadUnit ?? 'kbps',
      sessionLimitEnabled: defaultValues?.sessionLimitEnabled ?? false,
      sessionLimit: defaultValues?.sessionLimit ?? null,
    },
  })

  const [dataEnabled, timeEnabled, speedEnabled, sessionEnabled] = watch([
    'dataLimitEnabled', 'timeLimitEnabled', 'speedLimitEnabled', 'sessionLimitEnabled',
  ])

  const handleFormSubmit = (values: FormValues) => {
    return onSubmit({
      ...values,
      description: values.description || null,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Core fields */}
      <div className="space-y-2">
        <Label>Name *</Label>
        <Input {...register('name')} placeholder="e.g. 1 Hour Basic" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input {...register('description')} placeholder="Short description shown to users" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Price (ZAR) *</Label>
          <Input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Duration (days)</Label>
          <Input type="number" min="0" {...register('durationDays', { valueAsNumber: true })} placeholder="0 = unlimited" />
        </div>
        <div className="space-y-2">
          <Label>Sort Order</Label>
          <Input type="number" {...register('sortOrder', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>RADIUS Profile *</Label>
        <Input {...register('radiusProfile')} placeholder="e.g. basic-1hr" className="font-mono" />
        {errors.radiusProfile && <p className="text-xs text-destructive">{errors.radiusProfile.message}</p>}
        <p className="text-xs text-muted-foreground">The RadiusDesk profile name. Realm and Cloud ID are inherited from the site&apos;s RADIUS configuration.</p>
      </div>

      <Separator />

      {/* Data limit */}
      <div className="space-y-3">
        <LimitToggleRow label="Data Limit" name="dataLimitEnabled" control={control} />
        {dataEnabled && (
          <div className="grid grid-cols-2 gap-3 pl-2">
            <div className="space-y-1">
              <Label className="text-xs">Amount</Label>
              <Input type="number" min="0" {...register('dataAmount', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} placeholder="e.g. 500" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit</Label>
              <Input {...register('dataUnit')} placeholder="MB / GB" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Reset</Label>
              <Input {...register('dataReset')} placeholder="e.g. daily" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cap</Label>
              <Input {...register('dataCap')} placeholder="e.g. hard" />
            </div>
          </div>
        )}
      </div>

      {/* Time limit */}
      <div className="space-y-3">
        <LimitToggleRow label="Time Limit" name="timeLimitEnabled" control={control} />
        {timeEnabled && (
          <div className="grid grid-cols-2 gap-3 pl-2">
            <div className="space-y-1">
              <Label className="text-xs">Amount</Label>
              <Input type="number" min="0" {...register('timeAmount', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} placeholder="e.g. 60" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit</Label>
              <Input {...register('timeUnit')} placeholder="minutes / hours" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Reset</Label>
              <Input {...register('timeReset')} placeholder="e.g. daily" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cap</Label>
              <Input {...register('timeCap')} placeholder="e.g. hard" />
            </div>
          </div>
        )}
      </div>

      {/* Speed limit */}
      <div className="space-y-3">
        <LimitToggleRow label="Speed Limit" name="speedLimitEnabled" control={control} />
        {speedEnabled && (
          <div className="grid grid-cols-2 gap-3 pl-2">
            <div className="space-y-1">
              <Label className="text-xs">Download</Label>
              <Input type="number" min="0" {...register('speedDownloadAmount', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} placeholder="e.g. 2048" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Download Unit</Label>
              <Input {...register('speedDownloadUnit')} placeholder="kbps / Mbps" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Upload</Label>
              <Input type="number" min="0" {...register('speedUploadAmount', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} placeholder="e.g. 1024" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Upload Unit</Label>
              <Input {...register('speedUploadUnit')} placeholder="kbps / Mbps" />
            </div>
          </div>
        )}
      </div>

      {/* Session limit */}
      <div className="space-y-3">
        <LimitToggleRow label="Session Limit" name="sessionLimitEnabled" control={control} />
        {sessionEnabled && (
          <div className="pl-2">
            <div className="space-y-1">
              <Label className="text-xs">Max Concurrent Sessions</Label>
              <Input type="number" min="1" {...register('sessionLimit', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} placeholder="e.g. 1" className="w-40" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : defaultValues?.id ? 'Update Package' : 'Create Package'}
        </Button>
      </div>
    </form>
  )
}
