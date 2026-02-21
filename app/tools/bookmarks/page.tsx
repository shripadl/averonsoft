import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookmarkForm } from '@/components/tools/bookmark-form'
import { BookmarkList } from '@/components/tools/bookmark-list'

export default async function BookmarksPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's bookmarks and collections
  const [{ data: bookmarks }, { data: collections }] = await Promise.all([
    supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('bookmark_collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bookmark Manager</h1>
        <p className="mt-2 text-muted-foreground">
          Save and organize your favorite web resources
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <BookmarkForm collections={collections || []} />
        </div>
        <div className="lg:col-span-2">
          <BookmarkList 
            initialBookmarks={bookmarks || []} 
            collections={collections || []}
          />
        </div>
      </div>
    </div>
  )
}
