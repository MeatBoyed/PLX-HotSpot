'use client'

import { useForm, Controller, Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Package, CreatePackageInput, UpdatePackageInput } from '@/lib/types/package.types'

// ─── Dropdown option lists ────────────────────────────────────────────────────

const DATA_UNITS = ['MB', 'GB', 'TB']
const TIME_UNITS = ['minutes', 'hours', 'days']
const SPEED_UNITS = ['kbps', 'Mbps', 'Gbps']
const RESET_OPTIONS = ['never', 'daily', 'weekly', 'monthly']
const CAP_OPTIONS = ['hard', 'soft']

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().nullable().optional(),
  price: z.number({ error: 'Required' }).min(0, 'Price must be 0 or more'),
  radiusProfileId: z.number().nullable().optional(),
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface PackageFormProps {
  /** Pass an existing package to pre-fill (edit mode). Without it the form is in create mode. */
  defaultValues?: Partial<Package>
  onSubmit: (values: CreatePackageInput | UpdatePackageInput) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type LimitKey = 'dataLimitEnabled' | 'timeLimitEnabled' | 'speedLimitEnabled' | 'sessionLimitEnabled'

function LimitToggle({ label, name, control }: { label: string; name: LimitKey; control: Control<FormValues> }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-between py-1">
          <Label className="text-sm font-medium cursor-pointer">{label}</Label>
          <Switch checked={!!field.value} onCheckedChange={field.onChange} />
        </div>
      )}
    />
  )
}

function FieldSelect({ name, options, control, placeholder }: {
  name: keyof FormValues
  options: string[]
  control: Control<FormValues>
  placeholder?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select value={field.value as string ?? ''} onValueChange={field.onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder ?? 'Select…'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PackageForm({ defaultValues, onSubmit, onCancel, loading }: PackageFormProps) {
  const isEdit = !!defaultValues?.id

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      price: defaultValues?.price ?? 0,
      radiusProfileId: defaultValues?.radiusProfileId ?? null,
      sortOrder: defaultValues?.sortOrder ?? 1,
      durationDays: defaultValues?.durationDays ?? 0,
      dataLimitEnabled: defaultValues?.dataLimitEnabled ?? false,
      dataAmount: defaultValues?.dataAmount ?? null,
      dataUnit: defaultValues?.dataUnit ?? 'MB',
      dataReset: defaultValues?.dataReset ?? 'never',
      dataCap: defaultValues?.dataCap ?? 'hard',
      timeLimitEnabled: defaultValues?.timeLimitEnabled ?? false,
      timeAmount: defaultValues?.timeAmount ?? null,
      timeUnit: defaultValues?.timeUnit ?? 'minutes',
      timeReset: defaultValues?.timeReset ?? 'never',
      timeCap: defaultValues?.timeCap ?? 'hard',
      speedLimitEnabled: defaultValues?.speedLimitEnabled ?? false,
      speedUploadAmount: defaultValues?.speedUploadAmount ?? null,
      speedUploadUnit: defaultValues?.speedUploadUnit ?? 'Mbps',
      speedDownloadAmount: defaultValues?.speedDownloadAmount ?? null,
      speedDownloadUnit: defaultValues?.speedDownloadUnit ?? 'Mbps',
      sessionLimitEnabled: defaultValues?.sessionLimitEnabled ?? false,
      sessionLimit: defaultValues?.sessionLimit ?? null,
    },
  })

  const [dataEnabled, timeEnabled, speedEnabled, sessionEnabled] = watch([
    'dataLimitEnabled', 'timeLimitEnabled', 'speedLimitEnabled', 'sessionLimitEnabled',
  ])

  const handleFormSubmit = (values: FormValues) => {
    return onSubmit({ ...values, description: values.description || null })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

      {/* ── Core ── */}
      <div className="space-y-4">
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
            <Input type="number" step="0.01" min="0" {...register('price', { valueAsNumber: true })} />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Duration (days)</Label>
            <Input type="number" min="0" {...register('durationDays', { valueAsNumber: true })} placeholder="0 = unlimited" />
          </div>
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Input type="number" min="0" {...register('sortOrder', { valueAsNumber: true })} />
          </div>
        </div>

        {isEdit && (
          <div className="space-y-2">
            <Label>RADIUS Profile ID</Label>
            <Input
              type="number"
              className="font-mono"
              placeholder="Numeric ID from RadiusDesk"
              {...register('radiusProfileId', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })}
            />
            <p className="text-xs text-muted-foreground">The RadiusDesk profile ID. Set after creation once you have the profile ID from RadiusDesk.</p>
          </div>
        )}
      </div>

      <Separator />

      {/* ── Data limit ── */}
      <div className="space-y-3">
        <LimitToggle label="Data Limit" name="dataLimitEnabled" control={control} />
        {dataEnabled && (
          <div className="grid grid-cols-2 gap-3 pl-1 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Amount</Label>
              <Input type="number" min="0" placeholder="e.g. 500"
                {...register('dataAmount', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Unit</Label>
              <FieldSelect name="dataUnit" options={DATA_UNITS} control={control} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Reset</Label>
              <FieldSelect name="dataReset" options={RESET_OPTIONS} control={control} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cap type</Label>
              <FieldSelect name="dataCap" options={CAP_OPTIONS} control={control} />
            </div>
          </div>
        )}
      </div>

      {/* ── Time limit ── */}
      <div className="space-y-3">
        <LimitToggle label="Time Limit" name="timeLimitEnabled" control={control} />
        {timeEnabled && (
          <div className="grid grid-cols-2 gap-3 pl-1 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Amount</Label>
              <Input type="number" min="0" placeholder="e.g. 60"
                {...register('timeAmount', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Unit</Label>
              <FieldSelect name="timeUnit" options={TIME_UNITS} control={control} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Reset</Label>
              <FieldSelect name="timeReset" options={RESET_OPTIONS} control={control} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cap type</Label>
              <FieldSelect name="timeCap" options={CAP_OPTIONS} control={control} />
            </div>
          </div>
        )}
      </div>

      {/* ── Speed limit ── */}
      <div className="space-y-3">
        <LimitToggle label="Speed Limit" name="speedLimitEnabled" control={control} />
        {speedEnabled && (
          <div className="grid grid-cols-2 gap-3 pl-1 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Download speed</Label>
              <Input type="number" min="0" placeholder="e.g. 10"
                {...register('speedDownloadAmount', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Download unit</Label>
              <FieldSelect name="speedDownloadUnit" options={SPEED_UNITS} control={control} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Upload speed</Label>
              <Input type="number" min="0" placeholder="e.g. 5"
                {...register('speedUploadAmount', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Upload unit</Label>
              <FieldSelect name="speedUploadUnit" options={SPEED_UNITS} control={control} />
            </div>
          </div>
        )}
      </div>

      {/* ── Session limit ── */}
      <div className="space-y-3">
        <LimitToggle label="Session Limit" name="sessionLimitEnabled" control={control} />
        {sessionEnabled && (
          <div className="pl-1 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Max concurrent sessions</Label>
              <Input type="number" min="1" className="w-40" placeholder="e.g. 1"
                {...register('sessionLimit', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} />
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Update Package' : 'Create Package'}
        </Button>
      </div>
    </form>
  )
}
