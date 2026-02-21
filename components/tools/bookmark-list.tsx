'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Trash2, Tag } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Bookmark, BookmarkCollection } from '@/lib/types/database'

interface BookmarkListProps {
  initialBookmarks: Bookmark[]
  collections: BookmarkCollection[]
}

export function BookmarkList({ initialBookmarks, collections }: BookmarkListProps) {
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return

    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id)
      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      alert('Error deleting bookmark')
    }
  }

  const getCollectionName = (collectionId: string | null) => {
    if (!collectionId) return null
    const collection = collections.find(c => c.id === collectionId)
    return collection?.name
  }

  if (initialBookmarks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Bookmarks</CardTitle>
          <CardDescription>No bookmarks yet. Add your first one!</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bookmarks</CardTitle>
        <CardDescription>
          {initialBookmarks.length} bookmark{initialBookmarks.length !== 1 ? 's' : ''} saved
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {initialBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex items-start justify-between rounded-lg border p-4"
            >
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-medium">{bookmark.title}</h3>
                  {bookmark.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {bookmark.description}
                    </p>
                  )}
                </div>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {bookmark.url}
                </a>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDateTime(bookmark.created_at)}</span>
                  {getCollectionName(bookmark.collection_id) && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5">
                      {getCollectionName(bookmark.collection_id)}
                    </span>
                  )}
                  {bookmark.tags && bookmark.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {bookmark.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-2 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(bookmark.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDelete(bookmark.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
