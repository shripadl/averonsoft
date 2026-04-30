import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function PracticeExamAdminPage() {
  await requireAdmin('readonly')
  const supabase = await createClient()
  const service = createServiceClient()

  const [{ data: exams }, { count: pendingRefunds }, { count: activeExternalBundles }] = await Promise.all([
    supabase.from('exams').select('id, slug, name, provider, total_questions').eq('is_active', true).order('provider').order('name'),
    service
      .from('practice_payment_events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'refunded')
      .eq('refund_decision', 'pending'),
    service
      .from('practice_external_bundle_purchases')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
  ])

  const totalQuestions = (exams || []).reduce((sum, exam) => sum + (exam.total_questions || 0), 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Practice Exam Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage question banks, attempts, refunds, and external bundle allocations in one place.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Exams</CardTitle>
            <CardDescription>Total active practice exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(exams || []).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Question Bank Size</CardTitle>
            <CardDescription>Total questions across active exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Refund Decisions</CardTitle>
            <CardDescription>Refund cases awaiting admin choice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRefunds || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Question Bank</CardTitle>
            <CardDescription>Search/edit questions and run bulk updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/practice-questions">
              <Button className="w-full">Open Question Admin</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attempt Reset</CardTitle>
            <CardDescription>Reset one or more exam attempts for selected users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/practice-reset-attempts">
              <Button className="w-full">Open Reset Tool</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refund Decisions</CardTitle>
            <CardDescription>Revoke attempts or allow goodwill per refund.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/practice-refunds">
              <Button className="w-full">Open Refund Queue</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>External Bundle Allocations</CardTitle>
            <CardDescription>
              Purchases from Gumroad direct links. Active bundles: {activeExternalBundles || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/practice-external-bundles">
              <Button className="w-full">Open External Bundles</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practice Analytics</CardTitle>
            <CardDescription>Attempts, pass rates, and weak domains.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/practice-analytics">
              <Button className="w-full">Open Analytics</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
