'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const supabase = createClient()

  const handleGoogleSignUp = async () => {
    if (!accepted) {
      alert('Please accept the Terms of Service to continue')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing up:', error)
      alert('Error signing up. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Get started with AveronSoft for free
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I accept the{' '}
              <Link href="/legal/terms" className="text-primary hover:underline" target="_blank">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-primary hover:underline" target="_blank">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            onClick={handleGoogleSignUp}
            disabled={loading || !accepted}
            className="w-full"
            size="lg"
          >
            {loading ? 'Creating account...' : 'Sign up with Google'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
