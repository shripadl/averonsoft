import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AccountDeletePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Delete Account</h1>
      <p className="mt-4 text-muted-foreground">
        Account deletion is handled through your account settings.
      </p>
    </div>
  )
}
