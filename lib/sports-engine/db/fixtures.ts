import { createServiceClient } from '@/lib/supabase/server'

export type Fixture = {
  id: number
  sport_id: number
  external_id: string
  home_team: string
  away_team: string
  start_time: string
  status: string
}

export async function upsertFixture(input: Omit<Fixture, 'id'>) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('fixtures')
    .upsert(input, { onConflict: 'sport_id,external_id' })
    .select()
    .single()

  if (error) throw error
  return data as Fixture
}

/** Resolve primary key for a sport — do not hardcode ids (SERIAL order can differ across DBs). */
export async function getSportIdBySlug(slug: string): Promise<number> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('sports').select('id').eq('slug', slug).single()

  if (error || data == null) throw error ?? new Error(`Sport not found: ${slug}`)
  return Number(data.id)
}

/**
 * Fixtures for the sport in the current calendar window.
 * - Football: local midnight today → local midnight tomorrow (strict “today”).
 * - Cricket: local midnight today → start of day +14 (upcoming ~two weeks; APIs rarely align with a single UTC day).
 */
export async function getTodayFixturesBySportSlug(sportSlug: string) {
  const supabase = createServiceClient()
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const end =
    sportSlug === 'cricket'
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

  const { data: sport, error: sportError } = await supabase
    .from('sports')
    .select('id')
    .eq('slug', sportSlug)
    .single()

  if (sportError || !sport) throw sportError || new Error('Sport not found')

  const { data, error } = await supabase
    .from('fixtures')
    .select('*')
    .eq('sport_id', sport.id)
    .gte('start_time', start.toISOString())
    .lt('start_time', end.toISOString())
    .order('start_time', { ascending: true })

  if (error) throw error
  return (data ?? []) as Fixture[]
}

export async function getFixtureByIdAndSportSlug(
  sportSlug: string,
  fixtureId: number
): Promise<Fixture | null> {
  const supabase = createServiceClient()
  const sportId = await getSportIdBySlug(sportSlug)

  const { data, error } = await supabase
    .from('fixtures')
    .select('*')
    .eq('id', fixtureId)
    .eq('sport_id', sportId)
    .maybeSingle()

  if (error) throw error
  return (data ?? null) as Fixture | null
}
