import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Reset practice exam access for one user + exam to a single free attempt remaining.
 * Clears paid entitlements for that exam, marks free attempt as unused, and removes in-progress attempts.
 */
export async function resetPracticeExamEntitlementsToOneFree(
  supabase: SupabaseClient,
  userId: string,
  examSlug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: exam, error: examError } = await supabase.from('exams').select('id').eq('slug', examSlug).eq('is_active', true).maybeSingle()
  if (examError) return { ok: false, error: examError.message }
  if (!exam) return { ok: false, error: 'Exam not found or inactive' }

  const { error: delAtt } = await supabase
    .from('user_exam_attempts')
    .delete()
    .eq('user_id', userId)
    .eq('exam_id', exam.id)
    .is('completed_at', null)
  if (delAtt) return { ok: false, error: delAtt.message }

  const { error: entErr } = await supabase.from('user_exam_entitlements').delete().eq('user_id', userId).eq('exam_slug', examSlug)
  if (entErr) return { ok: false, error: entErr.message }

  const { error: accessErr } = await supabase.from('user_exam_access').upsert(
    {
      user_id: userId,
      exam_slug: examSlug,
      free_attempt_used: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,exam_slug' },
  )
  if (accessErr) return { ok: false, error: accessErr.message }

  return { ok: true }
}
