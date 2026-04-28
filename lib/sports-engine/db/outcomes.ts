import { createServiceClient } from '@/lib/supabase/server'

export type OutcomeRow = {
  id: number
  fixture_id: number
  result_label: string
  resolved_at: string
}

export type InsertOutcomeInput = Omit<OutcomeRow, 'id' | 'resolved_at'>

export async function insertOutcome(input: InsertOutcomeInput) {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('outcomes').insert(input).select().single()

  if (error) throw error
  return data as OutcomeRow
}

export async function getOutcomesForFixtureIds(fixtureIds: number[]) {
  if (fixtureIds.length === 0) return []
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('outcomes').select('*').in('fixture_id', fixtureIds)

  if (error) throw error
  return (data ?? []) as OutcomeRow[]
}

export async function getOutcomeForFixtureId(fixtureId: number) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('outcomes')
    .select('*')
    .eq('fixture_id', fixtureId)
    .order('resolved_at', { ascending: false })
    .maybeSingle()

  if (error) throw error
  return (data ?? null) as OutcomeRow | null
}
