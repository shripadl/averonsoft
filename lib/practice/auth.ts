import { createClient } from '@/lib/supabase/server'

export async function requireAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', status: 401 } as const
  }

  return { supabase, user } as const
}

export async function requirePracticeAdmin() {
  const result = await requireAuthenticatedUser()
  if ('error' in result) return result

  const { data: profile } = await result.supabase
    .from('profiles')
    .select('role, banned')
    .eq('id', result.user.id)
    .single()

  if (profile?.banned) {
    return { error: 'Forbidden', status: 403 } as const
  }

  if (!['admin', 'super_admin'].includes(profile?.role || '')) {
    return { error: 'Admin access required', status: 403 } as const
  }

  return result
}
