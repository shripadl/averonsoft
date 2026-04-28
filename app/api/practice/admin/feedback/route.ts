import { NextResponse } from 'next/server'
import { requirePracticeAdmin } from '@/lib/practice/auth'

export async function GET() {
  const auth = await requirePracticeAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { data, error } = await auth.supabase
    .from('question_feedback')
    .select('id, question_id, user_id, message, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ feedback: data || [] })
}
