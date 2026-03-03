import { requireAdmin, canManageRoles } from '@/lib/admin'
import { AdminUsersClient } from '@/app/admin/users/AdminUsersClient'

export default async function AdminUsersPage() {
  const { role } = await requireAdmin('readonly')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage platform users
        </p>
      </div>

      <AdminUsersClient canManageRoles={canManageRoles(role)} />
    </div>
  )
}
