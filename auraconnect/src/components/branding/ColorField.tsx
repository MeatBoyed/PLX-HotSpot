'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger
            type="button"
            className="h-9 w-9 rounded border border-input shrink-0 cursor-pointer"
            style={{ backgroundColor: value }}
            aria-label={`Pick color for ${label}`}
          />
          <PopoverContent className="w-auto p-3">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-32 w-32 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          </PopoverContent>
        </Popover>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono text-sm"
        />
      </div>
    </div>
  )
}
