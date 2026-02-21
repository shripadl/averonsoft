import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createServiceClient()

    // Verify Paddle webhook signature (implement based on Paddle docs)
    // For now, this is a placeholder

    const eventType = body.event_type

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionUpdate(supabase, body.data)
        break
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(supabase, body.data)
        break
      
      default:
        console.log('Unhandled event type:', eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleSubscriptionUpdate(supabase: any, data: any) {
  const { subscription_id, customer_id, status, items } = data
  
  // Extract user_id from custom_data or metadata
  const userId = data.custom_data?.user_id
  
  if (!userId) {
    console.error('No user_id in subscription data')
    return
  }

  const productType = items[0]?.price?.product?.name?.toLowerCase() || 'unknown'
  
  await supabase.from('subscription_status').upsert({
    user_id: userId,
    paddle_subscription_id: subscription_id,
    paddle_customer_id: customer_id,
    product_type: productType,
    status: status,
    current_period_start: data.current_billing_period?.starts_at,
    current_period_end: data.current_billing_period?.ends_at,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'paddle_subscription_id'
  })
}

async function handleSubscriptionCanceled(supabase: any, data: any) {
  const { subscription_id } = data
  
  await supabase
    .from('subscription_status')
    .update({
      status: 'cancelled',
      cancel_at: data.canceled_at,
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', subscription_id)
}
