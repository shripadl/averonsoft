/**
 * AI Agent endpoint - returns structured JSON actions for multi-file editing.
 * Uses routing by task complexity and enforces structured output prompts.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { callModel } from '@/lib/ai/model-router'
import { routeModelByComplexity, classifyTaskComplexity } from '@/lib/ai/ai-router'
import { parseAIResponse } from '@/lib/ai-workspace/parser'
import { STRUCTURED_OUTPUT_SYSTEM_PROMPT, buildFileContextPrompt, buildWorkspaceContextPrompt } from '@/lib/ai-workspace/prompts'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = createServiceClient()
    const { data: groqSetting } = await serviceClient
      .from('admin_settings')
      .select('value')
      .eq('key', 'groq_ai_enabled')
      .single()

    const groqEnabled = groqSetting?.value === true || groqSetting?.value === 'true'

    if (!groqEnabled) {
      return NextResponse.json(
        { error: 'AI tool is currently disabled.', code: 'AI_DISABLED' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { messages, fileContext, filePaths = [], preferHighQuality } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage?.content) {
      return NextResponse.json({ error: 'Last message must have content' }, { status: 400 })
    }

    const totalChars = (fileContext?.length || 0) + lastMessage.content.length
    const complexity = classifyTaskComplexity(
      lastMessage.content,
      filePaths.length,
      totalChars,
      preferHighQuality
    )

    const model = routeModelByComplexity(complexity, groqEnabled)
    if (!model) {
      return NextResponse.json(
        { error: 'No AI model configured. Add GROQ_API_KEY or other provider keys.' },
        { status: 503 }
      )
    }

    let systemPrompt = STRUCTURED_OUTPUT_SYSTEM_PROMPT
    systemPrompt += buildFileContextPrompt(fileContext)
    systemPrompt += buildWorkspaceContextPrompt(filePaths)

    const { content, tokensUsed } = await callModel(model, messages, systemPrompt)

    const parseResult = parseAIResponse(content)

    return NextResponse.json({
      raw: content,
      parseResult,
      model: model.id,
      tokensUsed,
      complexity,
    })
  } catch (error) {
    console.error('AI Agent error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI request failed' },
      { status: 500 }
    )
  }
}
