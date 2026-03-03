import { requireAdmin, canManageTools } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { AdminToolsClient } from '@/app/admin/tools/AdminToolsClient'

export default async function AdminToolsPage() {
  const { role } = await requireAdmin('readonly')
  if (!canManageTools(role)) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tool Management</h1>
        <p className="mt-2 text-muted-foreground">
          Enable, disable, or put tools in maintenance mode
        </p>
      </div>

      <AdminToolsClient />
    </div>
  )
}
