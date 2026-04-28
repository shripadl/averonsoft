import { NextRequest, NextResponse } from 'next/server'
import { requirePracticeAdmin } from '@/lib/practice/auth'
import { z } from 'zod'

const bodySchema = z.object({
  questionIds: z.array(z.string().uuid()).min(1).max(200),
  is_outdated: z.boolean(),
})

export async function POST(request: NextRequest) {
  const auth = await requirePracticeAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const json = await request.json()
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body: questionIds (1-200 uuids) and is_outdated required' }, { status: 400 })
  }

  const { questionIds, is_outdated } = parsed.data
  const { data, error } = await auth.supabase
    .from('exam_questions')
    .update({
      is_outdated,
      updated_at: new Date().toISOString(),
      last_reviewed_at: new Date().toISOString(),
    })
    .in('id', questionIds)
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ updated: data?.length ?? 0, is_outdated })
}
