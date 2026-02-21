'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { isValidUrl } from '@/lib/utils'
import type { BookmarkCollection } from '@/lib/types/database'

interface BookmarkFormProps {
  collections: BookmarkCollection[]
}

export function BookmarkForm({ collections }: BookmarkFormProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValidUrl(url)) {
      alert('Please enter a valid URL')
      return
    }

    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean)

      const { error } = await supabase.from('bookmarks').insert({
        user_id: user.id,
        url,
        title,
        description: description || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        collection_id: collectionId || null,
      })

      if (error) throw error

      setUrl('')
      setTitle('')
      setDescription('')
      setTags('')
      setCollectionId('')
      
      window.location.reload()
    } catch (error) {
      console.error('Error creating bookmark:', error)
      alert('Error creating bookmark. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Bookmark</CardTitle>
        <CardDescription>
          Save a new bookmark
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              URL *
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Favorite Article"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="design, inspiration, tutorial"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="collection" className="block text-sm font-medium mb-2">
              Collection
            </label>
            <select
              id="collection"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Bookmark'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
