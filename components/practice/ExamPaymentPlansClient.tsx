'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { EXAM_PLANS, type ExamPlanType } from '@/lib/practice/payment-plans'

interface ExamOption {
  slug: string
  name: string
  provider: string
}

function buildInitialSelection(count: number, preselectSlug: string | null) {
  return Array.from({ length: count }, (_, idx) => (idx === 0 ? preselectSlug || '' : ''))
}

export function ExamPaymentPlansClient({ exams, preselectedExamSlug }: { exams: ExamOption[]; preselectedExamSlug: string | null }) {
  const router = useRouter()
  const [single, setSingle] = useState<string[]>(() => buildInitialSelection(1, preselectedExamSlug))
  const [three, setThree] = useState<string[]>(() => buildInitialSelection(3, preselectedExamSlug))
  const [five, setFive] = useState<string[]>(() => buildInitialSelection(5, preselectedExamSlug))

  const examOptions = useMemo(
    () =>
      exams.map((exam) => ({
        label: `${exam.name} (${exam.provider})`,
        value: exam.slug,
      })),
    [exams],
  )

  function updateSelection(setter: (cb: (prev: string[]) => string[]) => void, index: number, value: string) {
    setter((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function proceed(planType: ExamPlanType, examSlugs: string[]) {
    const unique = [...new Set(examSlugs.filter(Boolean))]
    const plan = EXAM_PLANS[planType]
    if (unique.length !== plan.examCount) {
      alert(`Please select ${plan.examCount} unique exam(s).`)
      return
    }
    const q = new URLSearchParams({
      plan: planType,
      exams: unique.join(','),
    })
    router.push(`/exam-payment-confirmation?${q.toString()}`)
  }

  return (
    <div className="space-y-6">
      <PlanCard
        title="Single Exam Pack"
        subtitle="$9.99 • 5 attempts for 1 exam • valid 12 months"
        selections={single}
        examOptions={examOptions}
        onChange={(index, value) => updateSelection(setSingle, index, value)}
        onContinue={() => proceed('single_exam_pack', single)}
      />

      <PlanCard
        title="3-Exam Bundle"
        subtitle="$19.99 • 5 attempts each for any 3 exams • valid 12 months"
        selections={three}
        examOptions={examOptions}
        onChange={(index, value) => updateSelection(setThree, index, value)}
        onContinue={() => proceed('three_exam_bundle', three)}
      />

      <PlanCard
        title="5-Exam Bundle"
        subtitle="$29.99 • 5 attempts each for any 5 exams • valid 12 months"
        selections={five}
        examOptions={examOptions}
        onChange={(index, value) => updateSelection(setFive, index, value)}
        onContinue={() => proceed('five_exam_bundle', five)}
      />
    </div>
  )
}

function PlanCard({
  title,
  subtitle,
  selections,
  examOptions,
  onChange,
  onContinue,
}: {
  title: string
  subtitle: string
  selections: string[]
  examOptions: Array<{ label: string; value: string }>
  onChange: (index: number, value: string) => void
  onContinue: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {selections.map((value, idx) => (
          <label key={`${title}-${idx}`} className="flex flex-col gap-1 text-sm">
            <span>Exam {idx + 1}</span>
            <select
              className="rounded border border-border bg-background px-3 py-2 text-foreground"
              value={value}
              onChange={(e) => onChange(idx, e.target.value)}
            >
              <option value="">Select exam</option>
              {examOptions.map((option) => (
                <option key={`${title}-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </div>
  )
}
