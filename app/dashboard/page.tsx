import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Link as LinkIcon, Bookmark, CreditCard, LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user stats
  const [shortUrlsData, bookmarksData, businessCardsData] = await Promise.all([
    supabase.from('short_urls').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('business_cards').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const stats = {
    shortUrls: shortUrlsData.count || 0,
    bookmarks: bookmarksData.count || 0,
    businessCards: businessCardsData.count || 0,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user.email}
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <Button variant="secondary" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="mb-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Short URLs</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shortUrls}</div>
            <p className="text-xs text-muted-foreground">
              Total links created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookmarks}</div>
            <p className="text-xs text-muted-foreground">
              Saved bookmarks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.businessCards}</div>
            <p className="text-xs text-muted-foreground">
              Digital cards created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="mb-6 text-2xl font-bold">Your Tools</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>URL Shortener</CardTitle>
              <CardDescription>
                Create and manage short links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tools/shortener">
                <Button className="w-full">Open Tool</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Bookmark className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Bookmark Manager</CardTitle>
              <CardDescription>
                Organize your saved links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tools/bookmarks">
                <Button className="w-full">Open Tool</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Business Card</CardTitle>
              <CardDescription>
                Create your digital card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tools/business-card">
                <Button className="w-full">Open Tool</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
