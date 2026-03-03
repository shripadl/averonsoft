import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { selectModel, callModel } from '@/lib/ai/model-router'

const SYSTEM_PROMPT = `You are an AI coding assistant in a Mini-IDE. Help users write, refactor, and understand code.
- Be concise and focused.
- When suggesting code changes, use clear diff format when asked.
- Support multiple languages: JavaScript, TypeScript, Python, etc.
- If the user asks for "high quality" or "best quality", provide more thorough analysis.`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Groq AI is enabled (super admin toggle)
    const serviceClient = createServiceClient()
    const { data: groqSetting } = await serviceClient
      .from('admin_settings')
      .select('value')
      .eq('key', 'groq_ai_enabled')
      .single()

    const groqEnabled = groqSetting?.value === true || groqSetting?.value === 'true'

    if (!groqEnabled) {
      return NextResponse.json(
        { error: 'AI tool is currently disabled. Please try again later.', code: 'AI_DISABLED' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { messages, fileContext, preferHighQuality } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage?.content) {
      return NextResponse.json({ error: 'Last message must have content' }, { status: 400 })
    }

    const model = selectModel(lastMessage.content, preferHighQuality, groqEnabled)
    if (!model) {
      return NextResponse.json(
        { error: 'No AI model configured. Set GEMINI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY in environment.' },
        { status: 503 }
      )
    }

    let contextPrompt = SYSTEM_PROMPT
    if (fileContext && typeof fileContext === 'string' && fileContext.length > 0) {
      contextPrompt += `\n\nCurrent file context:\n${fileContext}`
    }

    const { content, tokensUsed } = await callModel(model, messages, contextPrompt)

    return NextResponse.json({
      message: { role: 'assistant', content },
      model: model.id,
      tokensUsed,
    })
  } catch (error) {
    console.error('AI Workspace chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI request failed' },
      { status: 500 }
    )
  }
}
