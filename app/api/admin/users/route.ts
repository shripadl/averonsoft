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
  return { supabase, user, role: profile?.role }
}

async function requireSuperAdmin() {
  const result = await requireAdminRole()
  if ('error' in result) return result
  if (result.role !== 'super_admin') {
    return { error: 'Super admin only', status: 403 } as const
  }
  return result
}

export async function GET(request: NextRequest) {
  const result = await requireAdminRole()
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  let query = result.supabase
    .from('profiles')
    .select('id, email, full_name, role, banned, created_at')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  const { data: users, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: subscriptions } = await result.supabase
    .from('subscription_status')
    .select('user_id, status, product_type')
    .in('user_id', users?.map(u => u.id) || [])

  const subMap = new Map((subscriptions || []).map(s => [s.user_id, s]))

  const usersWithSub = (users || []).map(u => ({
    ...u,
    subscription: subMap.get(u.id) || null,
  }))

  return NextResponse.json({ users: usersWithSub })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { action, userId, role, banned } = body

  if (action === 'role') {
    const result = await requireSuperAdmin()
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role required' }, { status: 400 })
    }
    if (!['super_admin', 'admin', 'support', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const { error } = await result.supabase.rpc('update_user_role', {
      target_id: userId,
      new_role: role,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  if (action === 'banned') {
    const result = await requireAdminRole()
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    if (!userId || typeof banned !== 'boolean') {
      return NextResponse.json({ error: 'userId and banned required' }, { status: 400 })
    }

    const { error } = await result.supabase.rpc('update_user_banned', {
      target_id: userId,
      banned,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
