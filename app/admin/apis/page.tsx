import { requireAdmin, canManageApis } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { AdminApisClient } from '@/app/admin/apis/AdminApisClient'

export default async function AdminApisPage() {
  const { role } = await requireAdmin('readonly')
  if (!canManageApis(role)) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Management</h1>
        <p className="mt-2 text-muted-foreground">
          Enable or disable API endpoints and manage keys
        </p>
      </div>

      <AdminApisClient />
    </div>
  )
}
