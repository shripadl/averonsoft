import type { SupabaseClient } from '@supabase/supabase-js'
import { grantAttemptsForExam } from '@/lib/practice/entitlements'

export async function tryAllocateExternalBundleForExam(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string | null | undefined,
  examSlug: string,
): Promise<{ allocated: boolean; reason?: string }> {
  const email = (userEmail || '').trim().toLowerCase()
  if (!email) return { allocated: false, reason: 'No user email available' }

  // If the user already has a valid entitlement for this exam, no allocation needed.
  const nowIso = new Date().toISOString()
  const { data: existingEntitlement } = await supabase
    .from('user_exam_entitlements')
    .select('attempts_remaining, expires_at')
    .eq('user_id', userId)
    .eq('exam_slug', examSlug)
    .gt('expires_at', nowIso)
    .maybeSingle()
  if ((existingEntitlement?.attempts_remaining ?? 0) > 0) {
    return { allocated: false, reason: 'Entitlement already exists for this exam' }
  }

  const { data: bundles, error: bundleErr } = await supabase
    .from('practice_external_bundle_purchases')
    .select('id, attempts_per_exam, remaining_exam_slots, validity_months, expires_at, status')
    .ilike('buyer_email', email)
    .eq('status', 'active')
    .gt('remaining_exam_slots', 0)
    .gt('expires_at', nowIso)
    .order('created_at', { ascending: true })
    .limit(50)

  if (bundleErr) {
    return { allocated: false, reason: bundleErr.message }
  }
  if (!bundles || bundles.length === 0) {
    return { allocated: false, reason: 'No active external bundles found' }
  }

  for (const bundle of bundles) {
    const { data: existingAlloc } = await supabase
      .from('practice_external_bundle_allocations')
      .select('id')
      .eq('purchase_id', bundle.id)
      .eq('exam_slug', examSlug)
      .maybeSingle()
    if (existingAlloc) continue

    const { error: allocErr } = await supabase.from('practice_external_bundle_allocations').insert({
      purchase_id: bundle.id,
      user_id: userId,
      exam_slug: examSlug,
    })
    if (allocErr) continue

    const expiresAt = bundle.expires_at || (() => {
      const dt = new Date()
      dt.setMonth(dt.getMonth() + (bundle.validity_months || 12))
      return dt.toISOString()
    })()

    await grantAttemptsForExam(
      supabase,
      userId,
      examSlug,
      bundle.attempts_per_exam || 5,
      expiresAt,
    )

    const nextSlots = Math.max(0, (bundle.remaining_exam_slots || 0) - 1)
    const { error: updErr } = await supabase
      .from('practice_external_bundle_purchases')
      .update({
        remaining_exam_slots: nextSlots,
        status: nextSlots === 0 ? 'exhausted' : 'active',
        claimed_user_id: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bundle.id)
    if (updErr) {
      return { allocated: true, reason: `Allocated but status update failed: ${updErr.message}` }
    }

    return { allocated: true }
  }

  return { allocated: false, reason: 'No available bundle slot for this exam' }
}
