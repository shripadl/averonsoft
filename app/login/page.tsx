import { Suspense } from 'react'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
