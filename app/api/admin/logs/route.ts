import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdminOrSupport() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 } as const

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, banned')
    .eq('id', user.id)
    .single()

  if (profile?.banned) return { error: 'Forbidden', status: 403 } as const
  if (!['admin', 'super_admin', 'support'].includes(profile?.role || '')) {
    return { error: 'Access required', status: 403 } as const
  }
  return { supabase }
}

export async function GET(request: NextRequest) {
  const result = await requireAdminOrSupport()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'activity'
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500)

  if (type === 'abuse') {
    const { data, error } = await result.supabase
      .from('abuse_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ logs: data })
  }

  const { data, error } = await result.supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ logs: data })
}
