import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getExamPlan } from '@/lib/practice/payment-plans'
import { grantAttemptsForExam } from '@/lib/practice/entitlements'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const eventType = body?.type || body?.event_type
  const payload = body?.data || body || {}

  if (!['payment.succeeded', 'transaction.completed'].includes(eventType)) {
    return NextResponse.json({ received: true, ignored: true })
  }

  const customData = payload?.custom_data || payload?.customData || {}
  const userId = (customData?.userId || payload?.user_id) as string | undefined
  const planType = (customData?.planType || payload?.planType) as string | undefined
  const examSlugs = Array.isArray(customData?.examSlugs)
    ? customData.examSlugs.map((x: unknown) => String(x))
    : Array.isArray(payload?.examSlugs)
      ? payload.examSlugs.map((x: unknown) => String(x))
      : []

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }
  const plan = getExamPlan(planType)
  if (!plan) {
    return NextResponse.json({ error: 'Missing or invalid planType in webhook data' }, { status: 400 })
  }
  if (examSlugs.length !== plan.examCount) {
    return NextResponse.json({ error: 'Webhook examSlugs does not match plan requirements' }, { status: 400 })
  }

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setMonth(expiresAt.getMonth() + plan.validityMonths)

  const supabase = createServiceClient()

  try {
    for (const examSlug of examSlugs) {
      await grantAttemptsForExam(supabase, userId, examSlug, plan.attemptsPerExam, expiresAt.toISOString())
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to grant entitlements' }, { status: 500 })
  }

  return NextResponse.json({ received: true, userId, planType: plan.type, examsGranted: examSlugs.length })
}
