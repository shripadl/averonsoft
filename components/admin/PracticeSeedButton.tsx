'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface PracticeSeedButtonProps {
  examSlug: string
}

export function PracticeSeedButton({ examSlug }: PracticeSeedButtonProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const router = useRouter()

  async function handleSeed() {
    setLoading(true)
    setStatus(null)
    try {
      const response = await fetch(`/api/practice/admin/exams/${examSlug}/seed-next`, {
        method: 'POST',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to seed next batch')
      }
      setStatus(
        data.inserted > 0
          ? `+${data.inserted} (now ${data.afterCount}/${data.target})`
          : `Already complete (${data.afterCount}/${data.target})`,
      )
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to seed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-right">
      <Button size="sm" variant="secondary" onClick={handleSeed} disabled={loading}>
        {loading ? 'Seeding...' : 'Seed next 50'}
      </Button>
      {status ? <p className="mt-1 text-xs text-muted-foreground">{status}</p> : null}
    </div>
  )
}

