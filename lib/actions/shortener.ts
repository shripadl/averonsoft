'use server'

import { createClient } from '@/lib/supabase/server'
import { generateShortCode } from '@/lib/utils/short-code'
import { revalidatePath } from 'next/cache'

export async function createShortUrl(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to create short URLs' }
  }

  const originalUrl = formData.get('originalUrl') as string
  const customCode = formData.get('customCode') as string
  
  if (!originalUrl) {
    return { error: 'Original URL is required' }
  }

  // Validate URL format
  try {
    new URL(originalUrl)
  } catch {
    return { error: 'Invalid URL format' }
  }

  const shortCode = customCode || generateShortCode()

  // Check if custom code already exists
  if (customCode) {
    const { data: existing } = await supabase
      .from('short_urls')
      .select('id')
      .eq('short_code', customCode)
      .single()
    
    if (existing) {
      return { error: 'This custom code is already taken' }
    }
  }

  const { data, error } = await supabase
    .from('short_urls')
    .insert({
      user_id: user.id,
      original_url: originalUrl,
      short_code: shortCode,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Failed to create short URL' }
  }

  revalidatePath('/tools/shortener')
  return { data, shortCode }
}

export async function getUserShortUrls() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: [] }
  }

  const { data, error } = await supabase
    .from('short_urls')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [] }
  }

  return { data }
}

export async function deleteShortUrl(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('short_urls')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Failed to delete short URL' }
  }

  revalidatePath('/tools/shortener')
  return { success: true }
}

export async function getShortUrlAnalytics(shortCode: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: urlData } = await supabase
    .from('short_urls')
    .select('*')
    .eq('short_code', shortCode)
    .eq('user_id', user.id)
    .single()

  if (!urlData) {
    return { error: 'Short URL not found' }
  }

  const { data: clicks } = await supabase
    .from('url_clicks')
    .select('*')
    .eq('short_url_id', urlData.id)
    .order('created_at', { ascending: false })

  return { data: { url: urlData, clicks: clicks || [] } }
}
