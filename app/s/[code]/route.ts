import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getDeviceType } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = await createClient()

  // Find the short URL
  const { data: shortUrl, error } = await supabase
    .from('short_urls')
    .select('*')
    .eq('short_code', code)
    .eq('is_active', true)
    .single()

  if (error || !shortUrl) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Track the click
  const userAgent = request.headers.get('user-agent') || ''
  const referrer = request.headers.get('referer') || null
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null

  await supabase.from('short_url_clicks').insert({
    short_url_id: shortUrl.id,
    referrer,
    user_agent: userAgent,
    ip_address: ip,
    device_type: getDeviceType(userAgent),
  })

  // Redirect to original URL
  return NextResponse.redirect(shortUrl.original_url)
}
