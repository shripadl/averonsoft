'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { safePostLoginPath } from '@/lib/safe-post-login-path'

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const nextSafe = safePostLoginPath(searchParams.get('next'))

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      const messages: Record<string, string> = {
        invalid_state: 'Invalid or expired session. Please try again.',
        missing_code: 'Authorization was not completed. Please try again.',
        oauth_denied: 'Sign-in was cancelled.',
        oauth_failed: 'Sign-in failed. Please try again.',
        oauth_start_failed: 'Could not start sign-in. Please try again.',
      }
      setErrorMessage(messages[error] || 'An error occurred. Please try again.')
    }
  }, [searchParams])

  useEffect(() => {
    const syncUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user?.email) {
        localStorage.setItem('user_email', data.user.email)
      }
    }
    syncUser()
  }, [])

  const handleGoogleSignIn = () => {
    setLoading(true)
    const href =
      nextSafe != null
        ? `/auth/google?next=${encodeURIComponent(nextSafe)}`
        : '/auth/google'
    window.location.href = href
  }

  const signupHref =
    nextSafe != null ? `/signup?next=${encodeURIComponent(nextSafe)}` : '/signup'

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your AveronSoft account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href={signupHref} className="text-primary hover:underline">
              Sign up
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="/legal/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
