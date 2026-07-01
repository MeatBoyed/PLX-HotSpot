import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">AuraConnect</h1>
        <p className="text-sm text-muted-foreground mt-1">Admin Portal</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  )
}
