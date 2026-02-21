import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShortenerClient } from '@/components/tools/shortener-client'

export default async function ShortenerPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's short URLs
  const { data: shortUrls } = await supabase
    .from('short_urls')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <ShortenerClient initialUrls={shortUrls || []} />
}
