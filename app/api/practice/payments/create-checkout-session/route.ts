import { NextRequest, NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/practice/auth'
import {
  getExamPlan,
  getGumroadProductPermalinkForPlan,
  getPaddleProductIdForPlan,
} from '@/lib/practice/payment-plans'

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const plan = getExamPlan(body?.planType)
  const examSlugsRaw: string[] = Array.isArray(body?.examSlugs)
    ? body.examSlugs.map((x: unknown) => String(x || '').trim()).filter((x: string) => x.length > 0)
    : []
  const examSlugs: string[] = Array.from(new Set(examSlugsRaw))

  if (!plan) {
    return NextResponse.json({ error: 'Invalid planType' }, { status: 400 })
  }
  if (examSlugs.length !== plan.examCount) {
    return NextResponse.json({ error: `This plan requires exactly ${plan.examCount} exam selection(s).` }, { status: 400 })
  }

  const { data: activeExams, error: examError } = await auth.supabase
    .from('exams')
    .select('slug')
    .in('slug', examSlugs)
    .eq('is_active', true)
  if (examError) {
    return NextResponse.json({ error: examError.message }, { status: 500 })
  }
  if ((activeExams || []).length !== examSlugs.length) {
    return NextResponse.json({ error: 'One or more selected exams are invalid.' }, { status: 400 })
  }

  const productId = getPaddleProductIdForPlan(plan)
  const provider = (process.env.PAYMENT_PROVIDER || 'gumroad').trim().toLowerCase()
  const appBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
  const customData = {
    source: 'practice_exams',
    userId: auth.user.id,
    planType: plan.type,
    examSlugs,
    attemptsPerExam: plan.attemptsPerExam,
    validityMonths: plan.validityMonths,
  }

  const firstExamSlug = examSlugs[0] || ''
  if (provider === 'paddle') {
    if (!productId) {
      return NextResponse.json(
        {
          error: `Missing product configuration: ${plan.paddleProductEnvKey}`,
        },
        { status: 500 },
      )
    }

    const query = new URLSearchParams({
      user_id: auth.user.id,
      product: productId,
      custom_data: JSON.stringify(customData),
      success: `${appBaseUrl}/practice/${encodeURIComponent(firstExamSlug)}`,
      cancel: `${appBaseUrl}/exam-payment-plans?exam=${encodeURIComponent(firstExamSlug)}`,
    })

    return NextResponse.json({
      provider: 'paddle',
      checkoutUrl: `https://checkout.paddle.com/checkout?${query.toString()}`,
      metadata: {
        userId: auth.user.id,
        planType: plan.type,
        examSlugs,
        productId,
      },
    })
  }

  const permalink = getGumroadProductPermalinkForPlan(plan)
  if (!permalink) {
    return NextResponse.json(
      {
        error: `Missing Gumroad product configuration: ${plan.gumroadProductEnvKey}`,
      },
      { status: 500 },
    )
  }

  const gumroadParams = new URLSearchParams({
    wanted: 'true',
    email: auth.user.email || '',
    user_id: auth.user.id,
    plan_type: plan.type,
    exam_slugs: examSlugs.join(','),
    redirect_url: `${appBaseUrl}/practice/${encodeURIComponent(firstExamSlug)}`,
  })

  return NextResponse.json({
    provider: 'gumroad',
    checkoutUrl: `https://gumroad.com/l/${encodeURIComponent(permalink)}?${gumroadParams.toString()}`,
    metadata: {
      userId: auth.user.id,
      planType: plan.type,
      examSlugs,
      productPermalink: permalink,
    },
  })
}
