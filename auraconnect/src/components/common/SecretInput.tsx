'use client'

import { useState } from 'react'
import type { FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface SecretInputProps<TFieldValues extends FieldValues> {
  label: string
  isSet: boolean
  placeholder: string
  name: Path<TFieldValues>
  register: UseFormRegister<TFieldValues>
}

export function SecretInput<TFieldValues extends FieldValues>({
  label,
  isSet,
  placeholder,
  name,
  register,
}: SecretInputProps<TFieldValues>) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {isSet
          ? <Badge variant="outline" className="text-green-700 border-green-300 gap-1 text-xs"><CheckCircle2 className="h-3 w-3" />Set</Badge>
          : <Badge variant="secondary" className="gap-1 text-xs"><AlertCircle className="h-3 w-3" />Not set</Badge>
        }
      </div>
      <div className="relative">
        <Input
          {...register(name)}
          type={show ? 'text' : 'password'}
          placeholder={isSet ? '••••••••••••  (leave blank to keep current)' : placeholder}
          className="font-mono pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {isSet ? 'Enter a new value to replace the existing one' : 'No value currently stored'}
      </p>
    </div>
  )
}
