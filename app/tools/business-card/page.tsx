import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BusinessCardEditor } from '@/components/tools/business-card-editor'

export default async function BusinessCardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's business cards
  const { data: cards } = await supabase
    .from('business_cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Digital Business Card</h1>
        <p className="mt-2 text-muted-foreground">
          Create and share your professional digital business card
        </p>
      </div>

      <BusinessCardEditor initialCards={cards || []} />
    </div>
  )
}
