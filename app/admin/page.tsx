import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, AlertTriangle, Code2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PracticeSeedButton } from '@/components/admin/PracticeSeedButton'
import { PracticeReplaceBankButton } from '@/components/admin/PracticeReplaceBankButton'
import { DEFAULT_QUESTION_BANK_TARGET, getQuestionBankTargetForSlug, isExamBankAtTarget } from '@/lib/practice/exam-bank-targets'

export default async function AdminPage() {
  const { role } = await requireAdmin('readonly')

  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalBusinessCards },
    { count: totalAiFiles },
    { count: pendingReports },
    { data: practiceExams },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('business_cards').select('id', { count: 'exact', head: true }),
    supabase.from('ai_workspace_files').select('id', { count: 'exact', head: true }),
    supabase.from('abuse_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('exams')
      .select('id, slug, name, provider, total_questions, is_active')
      .order('provider')
      .order('name'),
  ])

  const exams = practiceExams || []
  const totalPracticeQuestions = exams.reduce((sum, exam) => sum + (exam.total_questions || 0), 0)
  const completedPracticeExams = exams.filter((exam) => isExamBankAtTarget(exam.total_questions || 0, exam.slug)).length

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
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Practice Bank Health</CardTitle>
            <CardDescription>
              {completedPracticeExams}/{exams.length} exams at or above their bank target (default {DEFAULT_QUESTION_BANK_TARGET}, DevOps
              banks 500)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPracticeQuestions}</div>
            <p className="text-xs text-muted-foreground">Total practice questions across all exams</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Practice Analytics</CardTitle>
            <CardDescription>Attempts, scores, pass rate, domain weak spots</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/practice-analytics">
              <Button className="w-full">Open Analytics</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reset Attempts</CardTitle>
            <CardDescription>Restore free attempt access for selected users</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/practice-reset-attempts">
              <Button className="w-full" variant="secondary">Open Reset Tool</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Practice Refunds</CardTitle>
            <CardDescription>Decide revoke vs goodwill per refund case</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/practice-refunds">
              <Button className="w-full" variant="secondary">Open Refund Queue</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Practice Exams Coverage</CardTitle>
            <CardDescription>
              Per-exam target: {DEFAULT_QUESTION_BANK_TARGET} for most exams; 500 for DevOps practice banks (CKA, Docker DCA, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exams.map((exam) => {
                const count = exam.total_questions || 0
                const target = getQuestionBankTargetForSlug(exam.slug)
                const isReady = isExamBankAtTarget(count, exam.slug)
                return (
                  <div key={exam.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{exam.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {exam.provider} · <code>{exam.slug}</code> · {exam.is_active ? 'active' : 'inactive'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {count}/{target}
                      </p>
                      <p className={`text-xs ${isReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isReady ? 'Ready' : 'Needs generation'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <PracticeSeedButton examSlug={exam.slug} />
                      <PracticeReplaceBankButton examSlug={exam.slug} />
                      <Link href={`/admin/practice-reset-attempts?exam=${encodeURIComponent(exam.slug)}`}>
                        <Button variant="secondary">Reset Attempts</Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
