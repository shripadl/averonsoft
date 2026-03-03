import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'super_admin' | 'admin' | 'support' | 'user'

export interface ProfileWithRole {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  banned: boolean
  created_at: string
  updated_at: string
}

export async function getCurrentUserWithRole(): Promise<{
  user: { id: string; email?: string }
  profile: ProfileWithRole | null
} | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, banned, created_at, updated_at')
    .eq('id', user.id)
    .single()

  return {
    user: { id: user.id, email: user.email },
    profile: profile as ProfileWithRole | null,
  }
}

export function canAccessAdmin(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'super_admin' || role === 'support'
}

export function canManageRoles(role: UserRole | undefined): boolean {
  return role === 'super_admin'
}

export function canManageUsers(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function canManageSettings(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function canManageTools(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function canManageApis(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function canManageMaintenance(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function isReadOnlyAdmin(role: UserRole | undefined): boolean {
  return role === 'support'
}

export async function requireAdmin(access: 'full' | 'readonly' = 'full') {
  const result = await getCurrentUserWithRole()
  if (!result?.user) redirect('/login')

  const role = result.profile?.role || 'user'
  const banned = result.profile?.banned

  if (banned) redirect('/login')
  if (!canAccessAdmin(role)) redirect('/dashboard')

  if (access === 'full' && isReadOnlyAdmin(role)) {
    redirect('/dashboard')
  }

  return { ...result, role }
}
