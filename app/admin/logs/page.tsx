import { requireAdmin } from '@/lib/admin'
import { AdminLogsClient } from '@/app/admin/logs/AdminLogsClient'

export default async function AdminLogsPage() {
  await requireAdmin('readonly')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Logs</h1>
        <p className="mt-2 text-muted-foreground">
          User activity, API logs, and abuse reports
        </p>
      </div>

      <AdminLogsClient />
    </div>
  )
}
