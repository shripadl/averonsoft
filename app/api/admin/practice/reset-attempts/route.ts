import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resetPracticeExamEntitlementsToOneFree } from '@/lib/practice/admin-reset-attempts'

const bodySchema = z.object({
  mode: z.enum(['single', 'multiple', 'all']).default('single'),
  examSlug: z.string().min(1).max(200).optional(),
  examSlugs: z.array(z.string().min(1).max(200)).max(200).optional(),
  userIds: z.array(z.string().uuid()).max(100).optional(),
  emails: z.array(z.string().email()).max(100).optional(),
})

async function requireAdminNotSupport() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized', status: 401 } as const
  }
  const { data: profile } = await supabase.from('profiles').select('role, banned').eq('id', user.id).single()
  if (profile?.banned) {
    return { error: 'Forbidden', status: 403 } as const
  }
  if (!['admin', 'super_admin'].includes(profile?.role || '')) {
    return { error: 'Admin access required', status: 403 } as const
  }
  return { user, supabase } as const
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminNotSupport()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const json = await request.json()
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body: mode + exam selection + (userIds or emails) required' }, { status: 400 })
  }

  const { mode, examSlug, examSlugs, userIds: userIdsIn, emails: emailsIn } = parsed.data
  if ((!userIdsIn || userIdsIn.length === 0) && (!emailsIn || emailsIn.length === 0)) {
    return NextResponse.json({ error: 'Provide at least one userId or email' }, { status: 400 })
  }

  const service = createServiceClient()
  const targetIds = new Set<string>()

  if (userIdsIn?.length) {
    for (const id of userIdsIn) {
      targetIds.add(id)
    }
  }

  const notFoundEmails: string[] = []
  if (emailsIn?.length) {
    const unique = [...new Set(emailsIn.map((e) => e.trim().toLowerCase()))]
    for (const email of unique) {
      const { data, error } = await service.from('profiles').select('id').ilike('email', email).maybeSingle()
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      if (data?.id) {
        targetIds.add(data.id)
      } else {
        notFoundEmails.push(email)
      }
    }
  }

  if (targetIds.size === 0) {
    return NextResponse.json(
      { error: 'No matching users', notFoundEmails },
      { status: 400 },
    )
  }

  let selectedExamSlugs: string[] = []
  if (mode === 'single') {
    if (!examSlug) return NextResponse.json({ error: 'examSlug is required in single mode' }, { status: 400 })
    selectedExamSlugs = [examSlug]
  } else if (mode === 'multiple') {
    selectedExamSlugs = [...new Set((examSlugs || []).map((s) => s.trim()).filter(Boolean))]
    if (selectedExamSlugs.length === 0) {
      return NextResponse.json({ error: 'examSlugs is required in multiple mode' }, { status: 400 })
    }
  } else {
    const { data: activeExams, error: examsError } = await service
      .from('exams')
      .select('slug')
      .eq('is_active', true)
    if (examsError) return NextResponse.json({ error: examsError.message }, { status: 500 })
    selectedExamSlugs = (activeExams || []).map((e: { slug: string }) => e.slug)
    if (selectedExamSlugs.length === 0) {
      return NextResponse.json({ error: 'No active exams found' }, { status: 400 })
    }
  }

  const { data: validExams, error: validExamsError } = await service
    .from('exams')
    .select('slug')
    .in('slug', selectedExamSlugs)
    .eq('is_active', true)
  if (validExamsError) return NextResponse.json({ error: validExamsError.message }, { status: 500 })
  const validSet = new Set((validExams || []).map((e: { slug: string }) => e.slug))
  const invalidExamSlugs = selectedExamSlugs.filter((s) => !validSet.has(s))
  if (invalidExamSlugs.length > 0) {
    return NextResponse.json({ error: `Invalid/inactive exam slug(s): ${invalidExamSlugs.join(', ')}` }, { status: 400 })
  }

  const failures: { userId: string; error: string }[] = []
  let ok = 0
  let totalOps = 0
  for (const userId of targetIds) {
    for (const slug of selectedExamSlugs) {
      totalOps += 1
      const result = await resetPracticeExamEntitlementsToOneFree(service, userId, slug)
      if (result.ok) {
        ok += 1
      } else {
        failures.push({ userId, error: `${slug}: ${result.error}` })
      }
    }
  }

  return NextResponse.json({
    success: true,
    mode,
    examSlugs: selectedExamSlugs,
    resetCount: ok,
    totalOperations: totalOps,
    userCount: targetIds.size,
    failures,
    notFoundEmails,
  })
}
