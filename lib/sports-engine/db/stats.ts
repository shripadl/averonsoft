import { createServiceClient } from '@/lib/supabase/server'

export type FixtureStatRow = {
  id: number
  fixture_id: number
  feature_name: string
  feature_value: number
  created_at: string
}

/** Minimal row shape for prediction pipeline (feature columns only). */
export type FixtureStatNameValue = {
  feature_name: string
  feature_value: number
}

export async function insertStatsForFixture(
  fixtureId: number,
  stats: { feature_name: string; feature_value: number }[]
) {
  if (stats.length === 0) return
  const supabase = createServiceClient()
  const rows = stats.map((s) => ({
    fixture_id: fixtureId,
    feature_name: s.feature_name,
    feature_value: s.feature_value,
  }))
  const { error } = await supabase.from('fixture_stats').insert(rows)
  if (error) throw error
}

export async function getStatsForFixture(fixtureId: number): Promise<FixtureStatNameValue[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('fixture_stats')
    .select('feature_name, feature_value')
    .eq('fixture_id', fixtureId)

  if (error) throw error
  return (data ?? []) as FixtureStatNameValue[]
}
