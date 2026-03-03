import { requireAdmin, canManageMaintenance } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { AdminMaintenanceClient } from '@/app/admin/maintenance/AdminMaintenanceClient'

export default async function AdminMaintenancePage() {
  const { role } = await requireAdmin('readonly')
  if (!canManageMaintenance(role)) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Maintenance Mode</h1>
        <p className="mt-2 text-muted-foreground">
          Toggle global or per-tool maintenance
        </p>
      </div>

      <AdminMaintenanceClient />
    </div>
  )
}
