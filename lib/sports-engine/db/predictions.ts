import { createServiceClient } from '@/lib/supabase/server'

export type PredictionRow = {
  id: number
  fixture_id: number
  model_version: string
  probability: number
  confidence: string
  decision_category: string
  created_at: string
}

export type InsertPredictionInput = Omit<PredictionRow, 'id' | 'created_at'>

export async function insertPrediction(input: InsertPredictionInput) {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('predictions').insert(input).select().single()

  if (error) throw error
  return data as PredictionRow
}

export async function getPredictionsForFixtureIds(fixtureIds: number[]) {
  if (fixtureIds.length === 0) return []
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .in('fixture_id', fixtureIds)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as PredictionRow[]
}

export async function getPredictionsForFixtureId(fixtureId: number) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('fixture_id', fixtureId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as PredictionRow[]
}
