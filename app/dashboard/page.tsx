import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreditCard, Code2, Music, Hash, FileText, Braces } from 'lucide-react'
import { LogoutButton } from "@/app/components/LogoutButton"
import { getToolSettings, getVisibleTools } from '@/lib/tool-settings'

const TOOL_ICONS: Record<string, typeof CreditCard> = {
  pdfconverter: FileText,
  charactercounter: Hash,
  jsonformatter: Braces,
  businesscard: CreditCard,
  aiworkspace: Code2,
  daw: Music,
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const [userResult, toolSettings] = await Promise.all([
    supabase.auth.getUser(),
    getToolSettings(),
  ])

  const {
    data: { user },
  } = userResult

  if (!user) {
    redirect('/login')
  }

  const visibleTools = getVisibleTools(toolSettings)

  // Fetch user stats
  const { count: businessCardsCount } = await supabase
    .from('business_cards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const stats = {
    businessCards: businessCardsCount || 0,
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

        {/* Correct logout button */}
        <LogoutButton />
      </div>

      {/* Stats Grid */}
      <div className="mb-12 grid gap-6 md:grid-cols-3">
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {visibleTools.map((tool) => {
            const Icon = TOOL_ICONS[tool.key] ?? Hash
            const descriptions: Record<string, string> = {
              pdfconverter: 'Convert images, text to PDF. Merge, split, compress.',
              charactercounter: 'Count characters, words, sentences, and paragraphs',
              jsonformatter: 'Format, minify, and validate JSON.',
              businesscard: 'Create a card and export as PNG or PDF. No data stored.',
              aiworkspace: 'Mini-IDE with Monaco editor and AI assistant',
              daw: 'Record, mix, and export audio',
            }
            return (
              <Card key={tool.key}>
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>
                    {descriptions[tool.key]}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={tool.href}>
                    <Button className="w-full">Open Tool</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
