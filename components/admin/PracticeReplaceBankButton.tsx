'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface PracticeReplaceBankButtonProps {
  examSlug: string
}

export function PracticeReplaceBankButton({ examSlug }: PracticeReplaceBankButtonProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const router = useRouter()

  async function handleReplace() {
    const ok = window.confirm(
      'Replace this exam bank with a freshly generated 1000-question set? This will remove current questions for this exam.',
    )
    if (!ok) return

    setLoading(true)
    setStatus(null)
    try {
      const response = await fetch(`/api/practice/admin/exams/${examSlug}/replace-bank`, {
        method: 'POST',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to replace bank')
      }
      setStatus(`Replaced to ${data.afterCount}/${data.target}`)
      router.refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to replace bank')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-right">
      <Button size="sm" variant="destructive" onClick={handleReplace} disabled={loading}>
        {loading ? 'Replacing...' : 'Replace bank (1000)'}
      </Button>
      {status ? <p className="mt-1 text-xs text-muted-foreground">{status}</p> : null}
    </div>
  )
}

