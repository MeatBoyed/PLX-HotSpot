'use client'

import { AuthMethodsForm } from '@/components/sites/AuthMethodsForm'
import { updateAuthMethodsAction } from '@/lib/actions/auth-methods.actions'

interface Props {
  siteId: string
  selected: string[]
}

export function AuthMethodsFormClient({ siteId, selected }: Props) {
  return (
    <AuthMethodsForm
      selected={selected}
      onSave={(methods) => updateAuthMethodsAction(siteId, methods)}
    />
  )
}
