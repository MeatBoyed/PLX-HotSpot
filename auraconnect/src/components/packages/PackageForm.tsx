'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Package } from '@/lib/types/package.types'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  price: z.number({ error: 'Required' }).min(0, 'Price must be 0 or more'),
  durationValue: z.number({ error: 'Required' }).min(1, 'Duration must be at least 1'),
  durationType: z.enum(['minutes', 'hours', 'days', 'unlimited']),
  dataLimitMb: z.number().optional(),
  downloadSpeedKbps: z.number().optional(),
  uploadSpeedKbps: z.number().optional(),
  radiusProfile: z.string().min(1, 'RADIUS profile is required'),
  sortOrder: z.number({ error: 'Required' }).min(1),
})

type FormValues = z.infer<typeof schema>

interface PackageFormProps {
  defaultValues?: Partial<Package>
  onSubmit: (values: FormValues) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function PackageForm({ defaultValues, onSubmit, onCancel, loading }: PackageFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      price: defaultValues?.price ?? 0,
      durationValue: defaultValues?.durationValue ?? 1,
      durationType: defaultValues?.durationType ?? 'hours',
      dataLimitMb: defaultValues?.dataLimitMb,
      downloadSpeedKbps: defaultValues?.downloadSpeedKbps,
      uploadSpeedKbps: defaultValues?.uploadSpeedKbps,
      radiusProfile: defaultValues?.radiusProfile ?? '',
      sortOrder: defaultValues?.sortOrder ?? 1,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Name *</Label>
        <Input {...register('name')} placeholder="e.g. 1 Hour Basic" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input {...register('description')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Price (ZAR) *</Label>
          <Input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Sort Order</Label>
          <Input type="number" {...register('sortOrder', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duration Value *</Label>
          <Input type="number" {...register('durationValue', { valueAsNumber: true })} />
          {errors.durationValue && <p className="text-xs text-destructive">{errors.durationValue.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Duration Type</Label>
          <Select value={watch('durationType')} onValueChange={(v) => setValue('durationType', v as Package['durationType'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="unlimited">Unlimited</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Download Speed (Kbps)</Label>
          <Input type="number" {...register('downloadSpeedKbps', { valueAsNumber: true })} placeholder="10240" />
        </div>
        <div className="space-y-2">
          <Label>Upload Speed (Kbps)</Label>
          <Input type="number" {...register('uploadSpeedKbps', { valueAsNumber: true })} placeholder="5120" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>RADIUS Profile *</Label>
        <Input {...register('radiusProfile')} placeholder="e.g. basic-1hr" className="font-mono" />
        {errors.radiusProfile && <p className="text-xs text-destructive">{errors.radiusProfile.message}</p>}
      </div>

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : defaultValues?.id ? 'Update Package' : 'Create Package'}
        </Button>
      </div>
    </form>
  )
}
