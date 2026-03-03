'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import { Search, Ban, Shield, ShieldOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface UserWithSub {
  id: string
  email: string
  full_name: string | null
  role: string
  banned: boolean
  created_at: string
  subscription: { status: string; product_type: string } | null
}

export function AdminUsersClient({ canManageRoles }: { canManageRoles: boolean }) {
  const [users, setUsers] = useState<UserWithSub[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`)
    const data = await res.json()
    if (res.ok) setUsers(data.users || [])
    else toast.error(data.error || 'Failed to load users')
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [search])

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!canManageRoles) return
    setUpdating(userId)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'role', userId, role: newRole }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Role updated')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } else toast.error(data.error || 'Failed to update role')
    setUpdating(null)
  }

  const handleBanToggle = async (userId: string, banned: boolean) => {
    setUpdating(userId)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'banned', userId, banned }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(banned ? 'User banned' : 'User unbanned')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned } : u))
    } else toast.error(data.error || 'Failed to update')
    setUpdating(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>{users.length} users</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm sm:w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium">Email</th>
                  <th className="pb-3 text-left text-sm font-medium">Name</th>
                  <th className="pb-3 text-left text-sm font-medium">Role</th>
                  <th className="pb-3 text-left text-sm font-medium">Subscription</th>
                  <th className="pb-3 text-left text-sm font-medium">Created</th>
                  <th className="pb-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-3 text-sm">{u.email}</td>
                    <td className="py-3 text-sm">{u.full_name || '-'}</td>
                    <td className="py-3">
                      {canManageRoles ? (
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          disabled={updating === u.id}
                          className="rounded border border-border bg-background px-2 py-1 text-sm"
                        >
                          <option value="user">user</option>
                          <option value="support">support</option>
                          <option value="admin">admin</option>
                          <option value="super_admin">super_admin</option>
                        </select>
                      ) : (
                        <span className="text-sm">{u.role}</span>
                      )}
                    </td>
                    <td className="py-3 text-sm">
                      {u.subscription ? `${u.subscription.product_type} (${u.subscription.status})` : '-'}
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {formatDateTime(u.created_at)}
                    </td>
                    <td className="py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBanToggle(u.id, !u.banned)}
                        disabled={updating === u.id}
                        className={u.banned ? 'text-green-600' : 'text-destructive'}
                      >
                        {u.banned ? (
                          <>
                            <Shield className="h-4 w-4 mr-1" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 mr-1" />
                            Ban
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
