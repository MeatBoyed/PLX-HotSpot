'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Site } from '@/lib/types/site.types'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  ssid: z.string().min(1, 'SSID is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'maintenance', 'suspended', 'inactive']),
})

type FormValues = z.infer<typeof schema>

interface SiteFormProps {
  defaultValues?: Partial<Site>
  onSubmit: (values: FormValues) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function SiteForm({ defaultValues, onSubmit, onCancel, loading }: SiteFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      ssid: defaultValues?.ssid ?? '',
      description: defaultValues?.description ?? '',
      address: defaultValues?.address ?? '',
      status: defaultValues?.status ?? 'active',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Site Name *</Label>
        <Input id="name" {...register('name')} placeholder="Main Hall" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ssid">SSID *</Label>
        <Input id="ssid" {...register('ssid')} placeholder="VenueName-Area" className="font-mono" />
        {errors.ssid && <p className="text-xs text-destructive">{errors.ssid.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register('description')} placeholder="Brief site description" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} placeholder="Full address" />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={watch('status')} onValueChange={(v) => setValue('status', v as Site['status'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : defaultValues?.id ? 'Update Site' : 'Create Site'}
        </Button>
      </div>
    </form>
  )
}
