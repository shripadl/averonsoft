'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBookmark(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to create bookmarks' }
  }

  const url = formData.get('url') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const collectionId = formData.get('collectionId') as string
  const tags = formData.get('tags') as string
  
  if (!url || !title) {
    return { error: 'URL and title are required' }
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      user_id: user.id,
      url,
      title,
      description,
      collection_id: collectionId || null,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
    })
    .select()
    .single()

  if (error) {
    return { error: 'Failed to create bookmark' }
  }

  revalidatePath('/tools/bookmarks')
  return { data }
}

export async function getUserBookmarks(searchQuery?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: [] }
  }

  let query = supabase
    .from('bookmarks')
    .select('*, collections(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,url.ilike.%${searchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    return { data: [] }
  }

  return { data }
}

export async function updateBookmark(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const url = formData.get('url') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tags = formData.get('tags') as string

  const { data, error } = await supabase
    .from('bookmarks')
    .update({
      url,
      title,
      description,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: 'Failed to update bookmark' }
  }

  revalidatePath('/tools/bookmarks')
  return { data }
}

export async function deleteBookmark(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Failed to delete bookmark' }
  }

  revalidatePath('/tools/bookmarks')
  return { success: true }
}

export async function createCollection(name: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: user.id,
      name,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Failed to create collection' }
  }

  revalidatePath('/tools/bookmarks')
  return { data }
}

export async function getUserCollections() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: [] }
  }

  const { data, error } = await supabase
    .from('collections')
    .select('*, bookmarks(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [] }
  }

  return { data }
}
