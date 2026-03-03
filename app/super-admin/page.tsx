import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SuperAdminClient } from './SuperAdminClient'

const SUPER_ADMIN_EMAIL = 'limayeshri@gmail.com'

export default async function SuperAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Super Admin Console</h1>
        <p className="mt-2 text-muted-foreground">
          Platform-wide settings for {SUPER_ADMIN_EMAIL}
        </p>
      </div>

      <SuperAdminClient />
    </div>
  )
}
