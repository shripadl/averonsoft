import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, AlertTriangle, Code2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminPage() {
  const { role } = await requireAdmin('readonly')

  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalBusinessCards },
    { count: totalAiFiles },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('business_cards').select('id', { count: 'exact', head: true }),
    supabase.from('ai_workspace_files').select('id', { count: 'exact', head: true }),
    supabase.from('abuse_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Console</h1>
        <p className="mt-2 text-muted-foreground">
          Platform management and settings · Role: {role}
        </p>
      </div>

      <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBusinessCards || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Workspace</CardTitle>
            <Code2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAiFiles || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReports || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage platform users</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Abuse Reports</CardTitle>
            <CardDescription>Review and handle abuse reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/reports">
              <Button className="w-full">View Reports</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>Configure pricing and content</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/settings">
              <Button className="w-full">Manage Settings</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tool Management</CardTitle>
            <CardDescription>Enable, disable, or maintain tools</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/tools">
              <Button className="w-full">Manage Tools</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
