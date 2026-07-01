'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'

export function RegisterClient() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Mock registration — in production: POST /api/auth/register
    await new Promise((r) => setTimeout(r, 800))
    router.push('/home')
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-8">
      <div className="w-full max-w-sm space-y-6">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-1">
            <Image src="/AuraConnect.png" alt="AuraConnect" width={160} height={40} className="h-9 w-auto object-contain" />
          </div>
          <h1 className="text-xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">Join to purchase WiFi bundles and manage your connection</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border bg-card shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" placeholder="Thabo" value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Molefe" value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input id="phone" type="tel" placeholder="+27 82 000 0000" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="Min. 8 characters" className="pr-10"
                  value={form.password} onChange={set('password')} required minLength={8} />
                <button type="button" tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <Checkbox checked={marketing} onCheckedChange={(v) => setMarketing(!!v)} className="mt-0.5" />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I'd like to receive promotional offers and updates via email. You can unsubscribe at any time.
              </span>
            </label>

            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account & Connect'}
            </Button>
          </form>
        </div>

        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
          <p>
            <Link href="/splash" className="hover:underline">← Back</Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Powered by <span className="font-medium">AuraConnect</span>
        </p>
      </div>
    </div>
  )
}
