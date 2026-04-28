import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PracticeAdminClient } from '@/components/practice/PracticeAdminClient'

interface Props {
  params: Promise<{ examSlug: string }>
}

export default async function PracticeAdminPage({ params }: Props) {
  const { examSlug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'super_admin'].includes(profile?.role || '')) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">Practice Admin</h1>
        <PracticeAdminClient examSlug={examSlug} />
      </div>
    </div>
  )
}
