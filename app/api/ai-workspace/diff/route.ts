import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { selectModel, callModel } from '@/lib/ai/model-router'

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
        { error: 'AI tool is currently disabled. Please try again later.', code: 'AI_DISABLED' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { originalContent, userRequest, language } = body

    if (!originalContent || !userRequest) {
      return NextResponse.json(
        { error: 'originalContent and userRequest are required' },
        { status: 400 }
      )
    }

    const model = selectModel(userRequest, false, groqEnabled)
    if (!model) {
      return NextResponse.json(
        { error: 'No AI model configured for diff generation.' },
        { status: 503 }
      )
    }

    const systemPrompt = `You are a code diff generator. Given original code and a user request, output ONLY the changed result.
Format your response as the complete new file content - the user will apply it as a replacement.
Do not include explanations, markdown code blocks, or any text outside the code.
Language: ${language || 'plaintext'}`

    const messages = [
      {
        role: 'user' as const,
        content: `Original code:\n\`\`\`\n${originalContent}\n\`\`\`\n\nUser request: ${userRequest}\n\nOutput the complete new file content only:`,
      },
    ]

    const { content } = await callModel(model, messages, systemPrompt)

    // Strip markdown code blocks if present
    let diffContent = content.trim()
    const codeBlockMatch = diffContent.match(/```[\w]*\n?([\s\S]*?)```/)
    if (codeBlockMatch) {
      diffContent = codeBlockMatch[1].trim()
    }

    return NextResponse.json({
      newContent: diffContent,
      model: model.id,
    })
  } catch (error) {
    console.error('Diff generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Diff generation failed' },
      { status: 500 }
    )
  }
}
