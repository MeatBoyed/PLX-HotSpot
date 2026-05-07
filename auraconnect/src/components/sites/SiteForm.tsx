'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Site } from '@/lib/types/site.types'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  ssid: z.string().min(1, 'SSID is required'),
  domain: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
})

type FormValues = z.infer<typeof schema>

interface SiteFormProps {
  defaultValues?: Partial<Site>
  onSubmit: (values: FormValues) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function SiteForm({ defaultValues, onSubmit, onCancel, loading }: SiteFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      ssid: defaultValues?.ssid ?? '',
      domain: defaultValues?.domain ?? '',
      sortOrder: defaultValues?.sortOrder ?? undefined,
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
        <Label htmlFor="domain">
          Domain <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input id="domain" {...register('domain')} placeholder="portal.venue.co.za" className="font-mono" />
        {errors.domain && <p className="text-xs text-destructive">{errors.domain.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">
          Sort Order <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input id="sortOrder" type="number" {...register('sortOrder', { valueAsNumber: true })} placeholder="1" className="w-32" />
        {errors.sortOrder && <p className="text-xs text-destructive">{errors.sortOrder.message}</p>}
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
