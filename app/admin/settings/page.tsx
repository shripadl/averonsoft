import { requireAdmin, canManageSettings } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { AdminSettingsClient } from '@/app/admin/settings/AdminSettingsClient'

export default async function AdminSettingsPage() {
  const { role } = await requireAdmin('readonly')
  if (!canManageSettings(role)) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Configure contact, branding, and feature flags
        </p>
      </div>

      <AdminSettingsClient />
    </div>
  )
}
