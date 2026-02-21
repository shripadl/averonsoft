export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface ShortUrl {
  id: string
  user_id: string
  original_url: string
  short_code: string
  title: string | null
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface ShortUrlClick {
  id: string
  short_url_id: string
  clicked_at: string
  referrer: string | null
  user_agent: string | null
  ip_address: string | null
  country: string | null
  device_type: string | null
}

export interface Bookmark {
  id: string
  user_id: string
  url: string
  title: string
  description: string | null
  tags: string[] | null
  collection_id: string | null
  created_at: string
  updated_at: string
}

export interface BookmarkCollection {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface BusinessCard {
  id: string
  user_id: string
  slug: string
  full_name: string
  title: string | null
  bio: string | null
  email: string | null
  phone: string | null
  website: string | null
  social_links: Record<string, string>
  avatar_url: string | null
  qr_code_url: string | null
  template: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BusinessCardView {
  id: string
  card_id: string
  viewed_at: string
  referrer: string | null
  user_agent: string | null
  ip_address: string | null
  country: string | null
}

export interface AbuseReport {
  id: string
  reporter_email: string | null
  resource_type: 'short_url' | 'bookmark' | 'business_card'
  resource_id: string
  reason: string
  description: string | null
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
}

export interface AdminSetting {
  id: string
  key: string
  value: any
  updated_at: string
  updated_by: string | null
}

export interface SubscriptionStatus {
  id: string
  user_id: string
  paddle_subscription_id: string | null
  paddle_customer_id: string | null
  product_type: 'shortener_pro' | 'bookmarks_pro' | 'business_card_pro' | 'suite_bundle'
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  billing_cycle: 'monthly' | 'annual' | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at: string | null
  created_at: string
  updated_at: string
}

export interface Log {
  id: string
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, any> | null
  created_at: string
}
