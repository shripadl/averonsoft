'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface StartAttemptButtonProps {
  examSlug: string
}

export function StartAttemptButton({ examSlug }: StartAttemptButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/practice/exams/${examSlug}/attempts/start`, {
        method: 'POST',
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 402 && data?.paywall?.redirectTo) {
          router.push(data.paywall.redirectTo as string)
          return
        }
        throw new Error(data?.error || 'Failed to start attempt')
      }
      router.push(`/practice/${examSlug}/attempt/${data.attemptId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start attempt')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleStart} disabled={isLoading}>
        {isLoading ? 'Starting...' : 'Start New Attempt'}
      </Button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  )
}
