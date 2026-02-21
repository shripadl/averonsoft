import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils'

const ADMIN_EMAILS = ['slimaye2026@gmail.com']

export default async function AdminReportsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    redirect('/')
  }

  const { data: reports } = await supabase
    .from('abuse_reports')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Abuse Reports</h1>
        <p className="mt-2 text-muted-foreground">
          Review and handle user-reported content
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>
            {reports?.length || 0} total reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports && reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{report.resource_type}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            report.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : report.status === 'resolved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{report.reason}</p>
                      {report.description && (
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Reported: {formatDateTime(report.created_at)}
                        {report.reporter_email && ` by ${report.reporter_email}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reports yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
