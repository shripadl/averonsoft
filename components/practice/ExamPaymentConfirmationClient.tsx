'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { ExamPlanConfig, ExamPlanType } from '@/lib/practice/payment-plans'

interface Props {
  planType: ExamPlanType
  plan: ExamPlanConfig
  selectedExams: Array<{ slug: string; name: string; provider: string }>
}

export function ExamPaymentConfirmationClient({ planType, plan, selectedExams }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirmAndPay() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/practice/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          examSlugs: selectedExams.map((exam) => exam.slug),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Unable to start checkout')
      if (!data?.checkoutUrl) throw new Error('Checkout URL missing')
      window.location.href = data.checkoutUrl
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start checkout')
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h1 className="text-2xl font-bold">Final Confirmation</h1>
      <div className="mt-4 space-y-2 text-sm">
        <p>
          <span className="font-semibold">Plan:</span> {plan.name}
        </p>
        <p>
          <span className="font-semibold">Price:</span> ${plan.priceUsd.toFixed(2)}
        </p>
        <p>
          <span className="font-semibold">Attempts Included:</span> {plan.attemptsPerExam} per selected exam
        </p>
        <p>
          <span className="font-semibold">Validity:</span> {plan.validityMonths} months
        </p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold">Selected exams</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {selectedExams.map((exam) => (
            <li key={exam.slug}>
              {exam.name} ({exam.provider})
            </li>
          ))}
        </ul>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => router.back()} disabled={isLoading}>
          Go Back
        </Button>
        <Button onClick={confirmAndPay} disabled={isLoading}>
          {isLoading ? 'Redirecting...' : 'Confirm & Pay'}
        </Button>
      </div>
    </div>
  )
}
