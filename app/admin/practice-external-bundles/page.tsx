import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

export default async function PracticeExternalBundlesPage() {
  await requireAdmin('full')
  const service = createServiceClient()

  const [{ data: purchases }, { data: allocations }] = await Promise.all([
    service
      .from('practice_external_bundle_purchases')
      .select('id, provider_event_id, buyer_email, plan_type, remaining_exam_slots, attempts_per_exam, status, claimed_user_id, expires_at, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(200),
    service
      .from('practice_external_bundle_allocations')
      .select('purchase_id, user_id, exam_slug, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  const allocationsByPurchase = new Map<string, Array<{ user_id: string; exam_slug: string; created_at: string }>>()
  for (const a of allocations || []) {
    const list = allocationsByPurchase.get(a.purchase_id) || []
    list.push({ user_id: a.user_id, exam_slug: a.exam_slug, created_at: a.created_at })
    allocationsByPurchase.set(a.purchase_id, list)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Practice External Bundle Allocations</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tracks external Gumroad bundle purchases matched by buyer email and auto-allocated exam slots.
      </p>

      <div className="mt-6 space-y-4">
        {(purchases || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No external bundle purchases recorded yet. New direct Gumroad bundle purchases will appear here.
          </p>
        ) : null}
        {(purchases || []).map((p) => {
          const allocs = allocationsByPurchase.get(p.id) || []
          return (
            <div key={p.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{p.plan_type}</p>
                <p className="text-xs text-muted-foreground">
                  status: {p.status} · slots left: {p.remaining_exam_slots}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                buyer: {p.buyer_email} · attempts/exam: {p.attempts_per_exam} · expires: {new Date(p.expires_at).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">event: {p.provider_event_id}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                claimed user: {p.claimed_user_id || 'not linked yet'}
              </p>
              <div className="mt-2">
                <p className="text-xs font-medium">Allocations</p>
                {allocs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No exam allocations yet.</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                    {allocs.map((a, idx) => (
                      <li key={`${p.id}-${idx}`}>
                        {a.exam_slug} → {a.user_id} ({new Date(a.created_at).toLocaleString()})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
