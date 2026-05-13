import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateExamQuestions } from '@/lib/exam-generator/engine'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'

const bodySchema = z.object({
  topic: z.string().min(1).max(200),
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

export async function POST(request: NextRequest) {
  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'examgenerator')
  if (!accessible) {
    const msg = maintenance
      ? 'Exam Question Generator is temporarily unavailable for maintenance.'
      : 'Exam Question Generator is not available.'
    return NextResponse.json({ error: msg }, { status: 503 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'topic (string) and difficulty (easy|medium|hard) are required.' },
      { status: 400 }
    )
  }

  const result = generateExamQuestions(parsed.data)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    topic: result.topic,
    difficulty: result.difficulty,
    mappedDomain: result.mappedDomain,
    mcqs: result.mcqs.map(m => ({
      id: m.id,
      stem: m.stem,
      options: m.options,
      correctLabel: m.correctLabel,
      domain: m.domain,
    })),
  })
}
