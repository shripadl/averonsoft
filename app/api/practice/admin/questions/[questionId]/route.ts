import { NextRequest, NextResponse } from 'next/server'
import { requirePracticeAdmin } from '@/lib/practice/auth'
import { validateOriginalPracticeContent } from '@/lib/practice/legal'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const { questionId } = await params
  const auth = await requirePracticeAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (typeof body?.question_text === 'string') {
    const check = validateOriginalPracticeContent(body.question_text)
    if (!check.valid) {
      return NextResponse.json({ error: check.reason }, { status: 400 })
    }
    update.question_text = body.question_text
  }
  if (Array.isArray(body?.options)) update.options = body.options
  if (typeof body?.correct_option_id === 'string') update.correct_option_id = body.correct_option_id
  if (typeof body?.explanation === 'string') {
    const check = validateOriginalPracticeContent(body.explanation)
    if (!check.valid) {
      return NextResponse.json({ error: check.reason }, { status: 400 })
    }
    update.explanation = body.explanation
  }
  if (typeof body?.difficulty === 'string') update.difficulty = body.difficulty
  if (Object.prototype.hasOwnProperty.call(body ?? {}, 'domain')) {
    if (body.domain == null || body.domain === '') update.domain = null
    else if (typeof body.domain === 'string') update.domain = body.domain
  }
  if (typeof body?.is_outdated === 'boolean') update.is_outdated = body.is_outdated
  if (body?.last_reviewed_at || Object.keys(update).length > 1) {
    update.last_reviewed_at = body?.last_reviewed_at || new Date().toISOString()
  }

  const { data, error } = await auth.supabase
    .from('exam_questions')
    .update(update)
    .eq('id', questionId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ question: data })
}
