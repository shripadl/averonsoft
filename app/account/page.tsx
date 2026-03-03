import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="mt-4 text-muted-foreground">{user.email}</p>
      <div className="mt-6 flex gap-4">
        <Link href="/account/billing" className="text-primary hover:underline">Billing</Link>
        <Link href="/account/delete" className="text-primary hover:underline">Delete Account</Link>
      </div>
    </div>
  )
}
