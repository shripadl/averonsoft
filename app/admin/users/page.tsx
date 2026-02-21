import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils'

const ADMIN_EMAILS = ['slimaye2026@gmail.com']

export default async function AdminUsersPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    redirect('/')
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage platform users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {users?.length || 0} total users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium">Email</th>
                  <th className="pb-3 text-left text-sm font-medium">Full Name</th>
                  <th className="pb-3 text-left text-sm font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-3 text-sm">{user.email}</td>
                    <td className="py-3 text-sm">{user.full_name || '-'}</td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {formatDateTime(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
