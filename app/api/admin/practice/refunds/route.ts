import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revokeAttemptsForExam } from '@/lib/practice/entitlements'

async function requireAdminNotSupport() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 } as const

  const { data: profile } = await supabase.from('profiles').select('role, banned').eq('id', user.id).single()
  if (profile?.banned) return { error: 'Forbidden', status: 403 } as const
  if (!['admin', 'super_admin'].includes(profile?.role || '')) {
    return { error: 'Admin access required', status: 403 } as const
  }
  return { user } as const
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminNotSupport()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const sp = request.nextUrl.searchParams
  const status = sp.get('status') || 'pending'
  const q = (sp.get('q') || '').trim().toLowerCase()

  const service = createServiceClient()
  let userIdFilter: string[] | null = null
  if (q) {
    const { data: profiles, error: profileErr } = await service
      .from('profiles')
      .select('id, email')
      .ilike('email', `%${q}%`)
      .limit(300)
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })
    userIdFilter = (profiles || []).map((p: { id: string }) => p.id)
    // If query doesn't match an email, allow direct user_id search fallback.
    if (userIdFilter.length === 0) {
      userIdFilter = [q]
    }
  }

  let query = service
    .from('practice_payment_events')
    .select(
      'id, provider, provider_event_id, user_id, plan_type, exam_slugs, attempts_per_exam, status, refund_decision, refund_note, created_at, updated_at',
    )
    .order('updated_at', { ascending: false })
    .limit(200)
    .eq('status', 'refunded')

  if (status === 'pending') query = query.eq('refund_decision', 'pending')
  if (status === 'resolved') query = query.in('refund_decision', ['revoked', 'allowed'])
  if (userIdFilter && userIdFilter.length > 0) query = query.in('user_id', userIdFilter)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const userIds = [...new Set((data || []).map((row: { user_id: string }) => row.user_id))]
  const { data: profiles } = await service.from('profiles').select('id, email').in('id', userIds)
  const emailById = new Map((profiles || []).map((p: { id: string; email: string | null }) => [p.id, p.email]))

  const refunds = (data || []).map((row: Record<string, unknown>) => ({
    ...row,
    user_email: (emailById.get(String(row.user_id)) || null) as string | null,
  }))

  return NextResponse.json({ refunds })
}

const bodySchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['revoke', 'allow']),
  note: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  const auth = await requireAdminNotSupport()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const { id, action, note } = parsed.data

  const service = createServiceClient()
  const { data: event, error: eventError } = await service
    .from('practice_payment_events')
    .select('id, user_id, exam_slugs, attempts_per_exam, status, refund_decision')
    .eq('id', id)
    .single()
  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 })
  if (!event || event.status !== 'refunded') {
    return NextResponse.json({ error: 'Refund event not found' }, { status: 404 })
  }
  if (event.refund_decision && event.refund_decision !== 'pending') {
    return NextResponse.json({ error: 'Refund already resolved' }, { status: 400 })
  }

  const examSlugs = Array.isArray(event.exam_slugs)
    ? event.exam_slugs.map((x: unknown) => String(x))
    : []
  if (action === 'revoke') {
    for (const examSlug of examSlugs) {
      await revokeAttemptsForExam(service, event.user_id, examSlug, event.attempts_per_exam || 0)
    }
  }

  const { error: updateError } = await service
    .from('practice_payment_events')
    .update({
      refund_decision: action === 'revoke' ? 'revoked' : 'allowed',
      refund_note: note || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ success: true, id, action })
}
