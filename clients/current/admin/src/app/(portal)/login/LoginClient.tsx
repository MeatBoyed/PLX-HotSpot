'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export function LoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Mock: any email+password succeeds
    await new Promise((r) => setTimeout(r, 600))
    if (!email || !password) {
      setError('Please enter your email and password.')
      setLoading(false)
      return
    }
    router.push('/home')
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-1">
            <Image src="/AuraConnect.png" alt="AuraConnect" width={160} height={40} className="h-9 w-auto object-contain" />
          </div>
          <h1 className="text-xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to access the WiFi portal</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                  placeholder="••••••••" className="pr-10"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">Create one</Link>
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
