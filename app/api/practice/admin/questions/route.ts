import { NextRequest, NextResponse } from 'next/server'
import { requirePracticeAdmin } from '@/lib/practice/auth'
import { validateOriginalPracticeContent } from '@/lib/practice/legal'

const MAX_PAGE_SIZE = 100
const DEFAULT_PAGE_SIZE = 25

/** Sanitize for ilike: strip SQL LIKE wildcards so the query cannot be broadened. */
function safeIlikeQuery(s: string) {
  return s.replace(/[%_]/g, ' ').replace(/\s+/g, ' ').trim()
}

/** List questions for an exam with optional filters (admin). */
export async function GET(request: NextRequest) {
  const auth = await requirePracticeAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(request.url)
  const examSlug = searchParams.get('examSlug')?.trim()
  if (!examSlug) {
    return NextResponse.json({ error: 'examSlug query is required' }, { status: 400 })
  }

  const { data: exam, error: examError } = await auth.supabase
    .from('exams')
    .select('id, slug, name')
    .eq('slug', examSlug)
    .single()

  if (examError || !exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE),
  )
  const search = searchParams.get('q')?.trim() || searchParams.get('search')?.trim() || ''
  const domain = searchParams.get('domain')?.trim() || ''
  const difficulty = searchParams.get('difficulty')?.trim() || ''
  const outdated = searchParams.get('outdated')?.trim() || 'all' // all | true | false

  let query = auth.supabase
    .from('exam_questions')
    .select('id, exam_id, question_text, options, correct_option_id, explanation, difficulty, domain, is_outdated, last_reviewed_at, created_at, updated_at', { count: 'exact' })
    .eq('exam_id', exam.id)
    .order('updated_at', { ascending: false })

  const searchSafe = safeIlikeQuery(search)
  if (searchSafe) {
    query = query.ilike('question_text', `%${searchSafe}%`)
  }
  if (domain) {
    query = query.eq('domain', domain)
  }
  if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
    query = query.eq('difficulty', difficulty)
  }
  if (outdated === 'true') {
    query = query.eq('is_outdated', true)
  } else if (outdated === 'false') {
    query = query.eq('is_outdated', false)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data: questions, count, error } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: domainRows } = await auth.supabase
    .from('exam_questions')
    .select('domain')
    .eq('exam_id', exam.id)
    .not('domain', 'is', null)

  const domainSet = new Set<string>()
  for (const row of domainRows || []) {
    if (row.domain && String(row.domain).trim()) {
      domainSet.add(String(row.domain).trim())
    }
  }
  const domains = [...domainSet].sort((a, b) => a.localeCompare(b))

  return NextResponse.json({
    exam: { id: exam.id, slug: exam.slug, name: exam.name },
    questions: questions || [],
    total: count ?? 0,
    page,
    pageSize,
    domains,
  })
}

export async function POST(request: NextRequest) {
  const auth = await requirePracticeAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const { examSlug, question_text, options, correct_option_id, explanation, difficulty, domain } = body || {}

  if (!examSlug || !question_text || !Array.isArray(options) || !correct_option_id || !explanation) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const questionCheck = validateOriginalPracticeContent(question_text)
  if (!questionCheck.valid) {
    return NextResponse.json({ error: questionCheck.reason }, { status: 400 })
  }
  const explanationCheck = validateOriginalPracticeContent(explanation)
  if (!explanationCheck.valid) {
    return NextResponse.json({ error: explanationCheck.reason }, { status: 400 })
  }

  const { data: exam } = await auth.supabase
    .from('exams')
    .select('id')
    .eq('slug', examSlug)
    .single()

  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const { data, error } = await auth.supabase
    .from('exam_questions')
    .insert({
      exam_id: exam.id,
      question_text,
      options,
      correct_option_id,
      explanation,
      difficulty: difficulty || 'medium',
      domain: typeof domain === 'string' ? domain : null,
      is_outdated: false,
      last_reviewed_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ question: data })
}
