import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getExamPlan } from '@/lib/practice/payment-plans'
import { ExamPaymentConfirmationClient } from '@/components/practice/ExamPaymentConfirmationClient'

interface Props {
  searchParams: Promise<{ plan?: string; exams?: string }>
}

export default async function ExamPaymentConfirmationPage({ searchParams }: Props) {
  const sp = await searchParams
  const plan = getExamPlan(sp.plan)
  const examSlugs = (sp.exams || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

  if (!plan || examSlugs.length !== plan.examCount || new Set(examSlugs).size !== plan.examCount) {
    redirect('/exam-payment-plans')
  }

  const supabase = await createClient()
  const { data: exams } = await supabase
    .from('exams')
    .select('slug, name, provider')
    .in('slug', examSlugs)
    .eq('is_active', true)

  const selectedExams = (exams || []).sort((a, b) => examSlugs.indexOf(a.slug) - examSlugs.indexOf(b.slug))
  if (selectedExams.length !== plan.examCount) {
    redirect('/exam-payment-plans')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ExamPaymentConfirmationClient planType={plan.type} plan={plan} selectedExams={selectedExams} />
      </div>
    </div>
  )
}
