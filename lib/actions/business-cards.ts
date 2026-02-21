'use server'

import { createClient } from '@/lib/supabase/server'
import { generateShortCode } from '@/lib/utils/short-code'
import { revalidatePath } from 'next/cache'

export async function createBusinessCard(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to create business cards' }
  }

  const fullName = formData.get('fullName') as string
  const title = formData.get('title') as string
  const company = formData.get('company') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const website = formData.get('website') as string
  const linkedin = formData.get('linkedin') as string
  const twitter = formData.get('twitter') as string
  
  if (!fullName) {
    return { error: 'Full name is required' }
  }

  const slug = generateShortCode()

  const { data, error } = await supabase
    .from('business_cards')
    .insert({
      user_id: user.id,
      slug,
      full_name: fullName,
      title,
      company,
      email,
      phone,
      website,
      linkedin,
      twitter,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Failed to create business card' }
  }

  revalidatePath('/tools/business-card')
  return { data, slug }
}

export async function getUserBusinessCards() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: [] }
  }

  const { data, error } = await supabase
    .from('business_cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [] }
  }

  return { data }
}

export async function getBusinessCardBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('business_cards')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return { error: 'Business card not found' }
  }

  // Increment view count
  await supabase
    .from('business_cards')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id)

  return { data }
}

export async function updateBusinessCard(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const fullName = formData.get('fullName') as string
  const title = formData.get('title') as string
  const company = formData.get('company') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const website = formData.get('website') as string
  const linkedin = formData.get('linkedin') as string
  const twitter = formData.get('twitter') as string

  const { data, error } = await supabase
    .from('business_cards')
    .update({
      full_name: fullName,
      title,
      company,
      email,
      phone,
      website,
      linkedin,
      twitter,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: 'Failed to update business card' }
  }

  revalidatePath('/tools/business-card')
  return { data }
}

export async function deleteBusinessCard(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('business_cards')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Failed to delete business card' }
  }

  revalidatePath('/tools/business-card')
  return { success: true }
}
