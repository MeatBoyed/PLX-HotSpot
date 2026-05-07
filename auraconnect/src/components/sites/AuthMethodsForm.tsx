'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const AUTH_METHODS = [
  {
    value: 'free',
    label: 'Free Access',
    description: 'Users connect without any authentication',
  },
  {
    value: 'voucher',
    label: 'Voucher',
    description: 'Users authenticate with a pre-generated voucher code',
  },
  {
    value: 'email-password',
    label: 'Email & Password',
    description: 'Users register and sign in with an email address and password',
  },
  {
    value: 'name-phone',
    label: 'Name & Phone',
    description: 'Users provide their name and phone number to connect',
  },
] as const

interface AuthMethodsFormProps {
  selected: string[]
  onSave: (methods: string[]) => Promise<void>
}

export function AuthMethodsForm({ selected, onSave }: AuthMethodsFormProps) {
  const [methods, setMethods] = useState<string[]>(selected)
  const [loading, setLoading] = useState(false)

  function toggle(value: string) {
    setMethods((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    )
  }

  async function handleSave() {
    if (methods.length === 0) {
      toast.error('At least one auth method must be selected')
      return
    }
    setLoading(true)
    try {
      await onSave(methods)
      toast.success('Auth methods saved')
    } catch {
      toast.error('Failed to save auth methods')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-xl">
      <p className="text-sm text-muted-foreground">
        Select which authentication methods are available on the captive portal. At least one must be enabled.
      </p>

      <div className="space-y-3">
        {AUTH_METHODS.map(({ value, label, description }) => {
          const checked = methods.includes(value)
          return (
            <Card
              key={value}
              className={`cursor-pointer transition-colors ${checked ? 'border-primary' : ''}`}
              onClick={() => toggle(value)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <Checkbox
                  id={value}
                  checked={checked}
                  onCheckedChange={() => toggle(value)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor={value} className="text-sm font-medium cursor-pointer">
                    {label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Button onClick={handleSave} disabled={loading || methods.length === 0}>
        {loading ? 'Saving…' : 'Save Auth Methods'}
      </Button>
    </div>
  )
}
