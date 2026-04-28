import { NextRequest, NextResponse } from 'next/server'
import { requirePracticeAdmin } from '@/lib/practice/auth'

export async function POST(request: NextRequest) {
  const auth = await requirePracticeAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const requiredFields = ['slug', 'name', 'provider', 'description', 'total_questions']
  for (const field of requiredFields) {
    if (!body?.[field] && body?.[field] !== 0) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 })
    }
  }

  const { data, error } = await auth.supabase
    .from('exams')
    .insert({
      slug: body.slug,
      name: body.name,
      provider: body.provider,
      description: body.description,
      total_questions: body.total_questions,
      is_active: body.is_active ?? true,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ exam: data })
}
