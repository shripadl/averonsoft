import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Link as LinkIcon, Bookmark, CreditCard, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Admin email allowlist - in production, store this in database
const ADMIN_EMAILS = ['slimaye2026@gmail.com']

export default async function AdminPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    redirect('/')
  }

  // Fetch platform stats
  const [
    { count: totalUsers },
    { count: totalShortUrls },
    { count: totalBookmarks },
    { count: totalBusinessCards },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('short_urls').select('id', { count: 'exact', head: true }),
    supabase.from('bookmarks').select('id', { count: 'exact', head: true }),
    supabase.from('business_cards').select('id', { count: 'exact', head: true }),
    supabase.from('abuse_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Console</h1>
        <p className="mt-2 text-muted-foreground">
          Platform management and settings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
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
            <CardTitle className="text-sm font-medium">Short URLs</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShortUrls || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookmarks || 0}</div>
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
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReports || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </div>
  )
}
