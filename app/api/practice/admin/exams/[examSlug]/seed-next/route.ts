import { NextResponse } from 'next/server'
import { requirePracticeAdmin } from '@/lib/practice/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { seedNextBatchForExam } from '@/lib/practice/admin-seeding'

export async function POST(
  _: Request,
  { params }: { params: Promise<{ examSlug: string }> },
) {
  const { examSlug } = await params
  const auth = await requirePracticeAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const supabase = createServiceClient()
    const result = await seedNextBatchForExam(supabase, examSlug)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status = message.startsWith('Unsupported exam slug') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

