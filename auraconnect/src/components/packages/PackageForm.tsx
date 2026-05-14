'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Package, CreatePackageInput, UpdatePackageInput } from '@/lib/types/package.types'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().nullable().optional(),
  price: z.number({ error: 'Required' }).min(0, 'Price must be 0 or more'),
  radiusProfile: z.string().min(1, 'RADIUS profile is required'),
  radiusProfileId: z.number().nullable().optional(),
  sortOrder: z.number({ error: 'Required' }).min(0),
})

type FormValues = z.infer<typeof schema>

interface PackageFormProps {
  defaultValues?: Partial<Package>
  onSubmit: (values: CreatePackageInput | UpdatePackageInput) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function PackageForm({ defaultValues, onSubmit, onCancel, loading }: PackageFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      price: defaultValues?.price ?? 0,
      radiusProfile: defaultValues?.radiusProfile ?? '',
      radiusProfileId: defaultValues?.radiusProfileId ?? undefined,
      sortOrder: defaultValues?.sortOrder ?? 1,
    },
  })

  const handleFormSubmit = (values: FormValues) => {
    return onSubmit({
      ...values,
      description: values.description || null,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Name *</Label>
        <Input {...register('name')} placeholder="e.g. 1 Hour Basic" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input {...register('description')} placeholder="Short description shown to users" />
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

      <div className="space-y-2">
        <Label>RADIUS Profile *</Label>
        <Input {...register('radiusProfile')} placeholder="e.g. basic-1hr" className="font-mono" />
        {errors.radiusProfile && <p className="text-xs text-destructive">{errors.radiusProfile.message}</p>}
        <p className="text-xs text-muted-foreground">The RADIUS profile name assigned when this package is purchased. Realm and Cloud ID are inherited from the site&apos;s RADIUS configuration.</p>
      </div>

      <div className="space-y-2">
        <Label>RADIUS Profile ID</Label>
        <Input
          type="number"
          {...register('radiusProfileId', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })}
          placeholder="Optional numeric ID"
          className="font-mono"
        />
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
