import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getExamPlan, getExamPlanByProductRef } from '@/lib/practice/payment-plans'
import { grantAttemptsForExam } from '@/lib/practice/entitlements'

function parseNestedForm(rawBody: string) {
  const params = new URLSearchParams(rawBody)
  const out: Record<string, unknown> = {}

  function setPath(target: Record<string, unknown>, key: string, value: string) {
    const path = key.replace(/\]/g, '').split('[')
    let cur: Record<string, unknown> = target
    for (let i = 0; i < path.length; i += 1) {
      const part = path[i]
      if (!part) return
      const last = i === path.length - 1
      if (last) {
        cur[part] = value
      } else {
        const next = cur[part]
        if (typeof next !== 'object' || next === null) {
          cur[part] = {}
        }
        cur = cur[part] as Record<string, unknown>
      }
    }
  }

  for (const [k, v] of params.entries()) {
    setPath(out, k, v)
  }

  return out
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function asStringArrayCsv(value: unknown): string[] {
  const s = asString(value)
  if (!s) return []
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

function firstNonEmptyStringArray(...arrays: string[][]): string[] {
  for (const arr of arrays) {
    if (arr.length > 0) return arr
  }
  return []
}

function safeEqualHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'hex')
  const bBuf = Buffer.from(b, 'hex')
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

async function upsertPracticePaymentEvent(input: {
  provider: 'gumroad' | 'paddle'
  providerEventId: string
  userId: string
  planType: string
  examSlugs: string[]
  attemptsPerExam: number
  status: 'paid' | 'refunded'
  refundDecision: 'pending' | null
  rawPayload: Record<string, unknown>
}) {
  const supabase = createServiceClient()
  const nowIso = new Date().toISOString()
  const { error } = await supabase.from('practice_payment_events').upsert(
    {
      provider: input.provider,
      provider_event_id: input.providerEventId,
      user_id: input.userId,
      plan_type: input.planType,
      exam_slugs: input.examSlugs,
      attempts_per_exam: input.attemptsPerExam,
      status: input.status,
      refund_decision: input.refundDecision,
      raw_payload: input.rawPayload,
      updated_at: nowIso,
      created_at: nowIso,
    },
    { onConflict: 'provider_event_id' },
  )
  if (error) throw error
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const contentType = request.headers.get('content-type') || ''

  let body: Record<string, unknown>
  if (contentType.includes('application/json')) {
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
  } else {
    body = parseNestedForm(rawBody)
  }

  const isGumroad = !('type' in body) && !('event_type' in body)

  if (isGumroad) {
    const secret = process.env.GUMROAD_WEBHOOK_SECRET
    const signature = request.headers.get('x-gumroad-signature')
    if (secret && signature) {
      const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
      if (!safeEqualHex(expected, signature)) {
        return NextResponse.json({ error: 'Invalid Gumroad signature' }, { status: 401 })
      }
    }

    const refunded = asString(body['refunded'])

    const rawUrlParams = body['url_params']
    let urlParams: Record<string, unknown> = {}
    if (typeof rawUrlParams === 'object' && rawUrlParams !== null) {
      urlParams = rawUrlParams as Record<string, unknown>
    } else if (typeof rawUrlParams === 'string') {
      try {
        const parsed = JSON.parse(rawUrlParams)
        if (parsed && typeof parsed === 'object') {
          urlParams = parsed as Record<string, unknown>
        }
      } catch {
        // ignore invalid JSON; fall back to empty object
      }
    }

    const rawCustomFields = body['custom_fields']
    let customFields: Record<string, unknown> = {}
    if (typeof rawCustomFields === 'object' && rawCustomFields !== null) {
      customFields = rawCustomFields as Record<string, unknown>
    } else if (typeof rawCustomFields === 'string') {
      try {
        const parsed = JSON.parse(rawCustomFields)
        if (parsed && typeof parsed === 'object') {
          customFields = parsed as Record<string, unknown>
        }
      } catch {
        // ignore invalid JSON; fall back to empty object
      }
    }

    const userId = asString(urlParams['user_id']) || asString(customFields['user_id']) || asString(body['user_id'])
    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id in Gumroad payload' }, { status: 400 })
    }

    const explicitPlanType = asString(urlParams['plan_type']) || asString(customFields['plan_type']) || asString(body['plan_type'])
    const productRef = asString(body['product_permalink']) || asString(body['product_id'])
    const plan = getExamPlan(explicitPlanType) || getExamPlanByProductRef('gumroad', productRef)
    if (!plan) {
      return NextResponse.json({ error: 'Could not map Gumroad product to exam plan' }, { status: 400 })
    }

    const examSlugs = firstNonEmptyStringArray(
      asStringArrayCsv(urlParams['exam_slugs']),
      asStringArrayCsv(customFields['exam_slugs']),
      asStringArrayCsv(body['exam_slugs']),
    )

    if (examSlugs.length !== plan.examCount) {
      return NextResponse.json({ error: 'Gumroad exam_slugs does not match plan requirements' }, { status: 400 })
    }

    const gumroadEventId = asString(body['sale_id']) || asString(body['id']) || asString(body['purchase_id']) || null
    if (!gumroadEventId) {
      return NextResponse.json({ error: 'Missing Gumroad sale identifier' }, { status: 400 })
    }

    if (refunded === 'true') {
      try {
        await upsertPracticePaymentEvent({
          provider: 'gumroad',
          providerEventId: gumroadEventId,
          userId,
          planType: plan.type,
          examSlugs,
          attemptsPerExam: plan.attemptsPerExam,
          status: 'refunded',
          refundDecision: 'pending',
          rawPayload: body,
        })
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save refund event' }, { status: 500 })
      }
      return NextResponse.json({ received: true, provider: 'gumroad', refunded: true, decision: 'pending' })
    }

    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + plan.validityMonths)

    const supabase = createServiceClient()
    try {
      for (const examSlug of examSlugs) {
        await grantAttemptsForExam(supabase, userId, examSlug, plan.attemptsPerExam, expiresAt.toISOString())
      }
      await upsertPracticePaymentEvent({
        provider: 'gumroad',
        providerEventId: gumroadEventId,
        userId,
        planType: plan.type,
        examSlugs,
        attemptsPerExam: plan.attemptsPerExam,
        status: 'paid',
        refundDecision: null,
        rawPayload: body,
      })
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to grant entitlements' }, { status: 500 })
    }

    return NextResponse.json({ received: true, provider: 'gumroad', userId, planType: plan.type, examsGranted: examSlugs.length })
  }

  const eventType = (body?.type || body?.event_type) as string | undefined
  const payload = (body?.data || body || {}) as Record<string, unknown>

  if (!eventType || !['payment.succeeded', 'transaction.completed'].includes(eventType)) {
    return NextResponse.json({ received: true, ignored: true })
  }

  const customData = ((payload?.custom_data || payload?.customData || {}) as Record<string, unknown>) || {}
  const userId = asString(customData?.userId) || asString(payload?.user_id)
  const planType = asString(customData?.planType) || asString(payload?.planType)
  const examSlugs = Array.isArray(customData?.examSlugs)
    ? customData.examSlugs.map((x) => String(x))
    : Array.isArray(payload?.examSlugs)
      ? (payload.examSlugs as unknown[]).map((x) => String(x))
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
  const paddleEventId = asString(payload?.id) || asString(payload?.transaction_id) || asString(body?.id) || null
  if (!paddleEventId) {
    return NextResponse.json({ error: 'Missing Paddle event identifier' }, { status: 400 })
  }

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setMonth(expiresAt.getMonth() + plan.validityMonths)

  const supabase = createServiceClient()

  try {
    for (const examSlug of examSlugs) {
      await grantAttemptsForExam(supabase, userId, examSlug, plan.attemptsPerExam, expiresAt.toISOString())
    }
    await upsertPracticePaymentEvent({
      provider: 'paddle',
      providerEventId: paddleEventId,
      userId,
      planType: plan.type,
      examSlugs,
      attemptsPerExam: plan.attemptsPerExam,
      status: 'paid',
      refundDecision: null,
      rawPayload: body,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to grant entitlements' }, { status: 500 })
  }

  return NextResponse.json({ received: true, provider: 'paddle', userId, planType: plan.type, examsGranted: examSlugs.length })
}
