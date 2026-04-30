interface DbClient {
  from: (table: string) => any
}

export async function getFreeAttemptUsed(supabase: DbClient, userId: string, examSlug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_exam_access')
    .select('free_attempt_used')
    .eq('user_id', userId)
    .eq('exam_slug', examSlug)
    .maybeSingle()
  if (error) throw error
  return !!data?.free_attempt_used
}

export async function getPaidAttemptsRemaining(supabase: DbClient, userId: string, examSlug: string): Promise<number> {
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from('user_exam_entitlements')
    .select('attempts_remaining, expires_at')
    .eq('user_id', userId)
    .eq('exam_slug', examSlug)
    .gt('expires_at', nowIso)
    .maybeSingle()
  if (error) throw error
  return Math.max(0, data?.attempts_remaining ?? 0)
}

export async function getAttemptsRemaining(supabase: DbClient, userId: string, examSlug: string) {
  const [freeUsed, paidRemaining] = await Promise.all([
    getFreeAttemptUsed(supabase, userId, examSlug),
    getPaidAttemptsRemaining(supabase, userId, examSlug),
  ])
  return {
    freeAttemptUsed: freeUsed,
    paidAttemptsRemaining: paidRemaining,
    totalAttemptsRemaining: (freeUsed ? 0 : 1) + paidRemaining,
  }
}

export async function consumeAttempt(supabase: DbClient, userId: string, examSlug: string) {
  const state = await getAttemptsRemaining(supabase, userId, examSlug)
  if (!state.freeAttemptUsed) {
    const { error } = await supabase.from('user_exam_access').upsert(
      {
        user_id: userId,
        exam_slug: examSlug,
        free_attempt_used: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,exam_slug' },
    )
    if (error) throw error
    return { source: 'free' as const }
  }

  if (state.paidAttemptsRemaining <= 0) return null

  const next = state.paidAttemptsRemaining - 1
  // Update by user+exam key; state already ensured this entitlement is active.
  const { error } = await supabase
    .from('user_exam_entitlements')
    .update({
      attempts_remaining: next,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('exam_slug', examSlug)

  if (error) throw error
  return { source: 'paid' as const }
}

export async function grantAttemptsForExam(
  supabase: DbClient,
  userId: string,
  examSlug: string,
  attemptsToAdd: number,
  expiresAtIso: string,
) {
  const nowIso = new Date().toISOString()
  const { data: existing, error: existingError } = await supabase
    .from('user_exam_entitlements')
    .select('attempts_remaining, expires_at')
    .eq('user_id', userId)
    .eq('exam_slug', examSlug)
    .maybeSingle()
  if (existingError) throw existingError

  const stillValid = existing?.expires_at ? new Date(existing.expires_at).getTime() > Date.now() : false
  const base = stillValid ? existing?.attempts_remaining ?? 0 : 0
  const mergedExpiresAt =
    stillValid && existing?.expires_at && new Date(existing.expires_at).getTime() > new Date(expiresAtIso).getTime()
      ? existing.expires_at
      : expiresAtIso

  const { error } = await supabase.from('user_exam_entitlements').upsert(
    {
      user_id: userId,
      exam_slug: examSlug,
      attempts_remaining: base + attemptsToAdd,
      expires_at: mergedExpiresAt,
      created_at: nowIso,
      updated_at: nowIso,
    },
    { onConflict: 'user_id,exam_slug' },
  )
  if (error) throw error
}

export async function revokeAttemptsForExam(
  supabase: DbClient,
  userId: string,
  examSlug: string,
  attemptsToRemove: number,
) {
  if (attemptsToRemove <= 0) return
  const nowIso = new Date().toISOString()
  const { data: existing, error: existingError } = await supabase
    .from('user_exam_entitlements')
    .select('attempts_remaining, expires_at')
    .eq('user_id', userId)
    .eq('exam_slug', examSlug)
    .gt('expires_at', nowIso)
    .maybeSingle()
  if (existingError) throw existingError
  if (!existing) return

  const next = Math.max(0, (existing.attempts_remaining ?? 0) - attemptsToRemove)
  const { error } = await supabase
    .from('user_exam_entitlements')
    .update({ attempts_remaining: next, updated_at: nowIso })
    .eq('user_id', userId)
    .eq('exam_slug', examSlug)
    .gt('expires_at', nowIso)
  if (error) throw error
}
