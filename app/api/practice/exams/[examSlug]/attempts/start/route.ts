import { NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/practice/auth'
import { canUserStartAttempt, getExamBySlug, getUserAttemptCount } from '@/lib/practice/service'
import { consumeAttempt } from '@/lib/practice/entitlements'
import { createServiceClient } from '@/lib/supabase/server'
import { tryAllocateExternalBundleForExam } from '@/lib/practice/external-bundle-allocation'

export async function POST(_: Request, { params }: { params: Promise<{ examSlug: string }> }) {
  const { examSlug } = await params
  const auth = await requireAuthenticatedUser()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const exam = await getExamBySlug(auth.supabase, examSlug)
  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const service = createServiceClient()
  let gate = await canUserStartAttempt(auth.supabase, auth.user.id, exam)
  if (!gate.allowed) {
    // If this user bought a bundle externally on Gumroad (by email), allocate on-demand.
    await tryAllocateExternalBundleForExam(service, auth.user.id, auth.user.email, exam.slug)
    gate = await canUserStartAttempt(auth.supabase, auth.user.id, exam)
  }
  if (!gate.allowed) {
    return NextResponse.json(
      {
        error: gate.paywall?.message || 'No attempts remaining',
        code: gate.reason,
        paywall: gate.paywall,
      },
      { status: 402 },
    )
  }

  const consumption = await consumeAttempt(service, auth.user.id, exam.slug)
  if (!consumption) {
    return NextResponse.json(
      {
        error: 'No attempts remaining',
        code: 'PAYWALL_REQUIRED',
        paywall: {
          redirectTo: `/exam-payment-plans?exam=${encodeURIComponent(exam.slug)}`,
        },
      },
      { status: 402 },
    )
  }

  const attemptId = crypto.randomUUID()
  const attemptCount = await getUserAttemptCount(auth.supabase, auth.user.id, exam.id)
  const { error: insertError } = await auth.supabase.from('user_exam_attempts').insert({
    id: attemptId,
    user_id: auth.user.id,
    exam_id: exam.id,
    score: 0,
    total_questions: 0,
    started_at: new Date().toISOString(),
    completed_at: null,
    attempt_number_for_exam: attemptCount + 1,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ attemptId, source: consumption.source })
}
