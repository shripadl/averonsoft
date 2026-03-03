import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdminRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 } as const

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, banned')
    .eq('id', user.id)
    .single()

  if (profile?.banned) return { error: 'Forbidden', status: 403 } as const
  if (!['admin', 'super_admin'].includes(profile?.role || '')) {
    return { error: 'Admin access required', status: 403 } as const
  }
  return { supabase, user }
}

export async function GET() {
  const result = await requireAdminRole()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { data, error } = await result.supabase
    .from('admin_settings')
    .select('key, value')
    .order('key')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const settings = Object.fromEntries((data || []).map(s => [s.key, s.value]))
  return NextResponse.json({ settings })
}

export async function POST(request: NextRequest) {
  const result = await requireAdminRole()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const body = await request.json()
  const { key, value } = body

  if (!key) {
    return NextResponse.json({ error: 'key required' }, { status: 400 })
  }

  const jsonValue =
    value === null || value === undefined
      ? false
      : typeof value === 'string' && (value === 'true' || value === 'false')
        ? value === 'true'
        : value

  const row = {
    key,
    value: jsonValue,
    updated_at: new Date().toISOString(),
    updated_by: result.user.id,
  }

  const { data: existing } = await result.supabase
    .from('admin_settings')
    .select('id')
    .eq('key', key)
    .single()

  if (existing?.id) {
    const { error } = await result.supabase
      .from('admin_settings')
      .update(row)
      .eq('key', key)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    const { error } = await result.supabase
      .from('admin_settings')
      .insert(row)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
