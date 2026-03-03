import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

const SUPER_ADMIN_EMAIL = 'limayeshri@gmail.com'

async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    return { error: 'Forbidden', status: 403 } as const
  }
  return { user }
}

export async function GET() {
  const result = await requireSuperAdmin()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const serviceClient = createServiceClient()
  const { data } = await serviceClient
    .from('admin_settings')
    .select('value')
    .eq('key', 'groq_ai_enabled')
    .single()

  const enabled = data?.value === true || data?.value === 'true'
  return NextResponse.json({ enabled })
}

export async function POST(request: NextRequest) {
  const result = await requireSuperAdmin()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const body = await request.json()
  const enabled = body.enabled === true

  const serviceClient = createServiceClient()
  const { data: existing } = await serviceClient
    .from('admin_settings')
    .select('id')
    .eq('key', 'groq_ai_enabled')
    .single()

  const row = {
    key: 'groq_ai_enabled',
    value: enabled,
    updated_at: new Date().toISOString(),
    updated_by: result.user.id,
  }

  if (existing?.id) {
    const { error } = await serviceClient
      .from('admin_settings')
      .update(row)
      .eq('key', 'groq_ai_enabled')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    const { error } = await serviceClient
      .from('admin_settings')
      .insert(row)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, enabled })
}
