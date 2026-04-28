'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PracticePaywallCardProps {
  examSlug: string
  message?: string | null
}

export function PracticePaywallCard({
  examSlug,
  message,
}: PracticePaywallCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-xl font-semibold">Attempts Required</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {message || 'Your free attempt is used for this exam. Purchase an exam pack to continue practicing.'}
      </p>
      <div className="mt-4">
        <Link href={`/exam-payment-plans?exam=${encodeURIComponent(examSlug)}`}>
          <Button>View Exam Payment Plans</Button>
        </Link>
      </div>
    </div>
  )
}

