import { createServiceClient } from '@/lib/supabase/server'
import type { Fixture } from '@/lib/sports-engine/db/fixtures'
import type { PredictionRow } from '@/lib/sports-engine/db/predictions'
import { evaluatePrediction } from '@/lib/sports-engine/validation/evaluate-prediction'

export type ValidationRange = '7d' | '30d'

export type ValidationRow = {
  fixture_id: number
  sport_slug: string
  home_team: string
  away_team: string
  start_time: string
  prediction_date: string | null
  model_version: string
  probability: number
  predicted_lean: 'home' | 'away'
  decision_category: string
  confidence: string
  actual_result: string
  hit: boolean | null
  error_abs: number | null
}

export type ValidationSummary = {
  range: ValidationRange
  from: string
  to: string
  total_evaluated: number
  scorable: number
  hits: number
  misses: number
  hit_rate: number | null
  avg_error_abs: number | null
  by_category: Record<string, { total: number; hits: number; hit_rate: number | null }>
  by_sport: Record<string, { total: number; hits: number; hit_rate: number | null }>
  daily: Array<{ date: string; total: number; hits: number; hit_rate: number | null }>
  rows: ValidationRow[]
  generated_at: string
}

type FixtureWithSport = Fixture & { sport_slug: string }

function priorDayYmd(iso: string): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

function pickPriorDayPrediction(
  predictions: PredictionRow[],
  startTime: string
): PredictionRow | null {
  const priorDay = priorDayYmd(startTime)
  const onPriorDay = predictions.filter((p) => p.created_at.slice(0, 10) === priorDay)
  if (onPriorDay.length > 0) return onPriorDay[0]!

  const beforeKickoff = predictions.filter((p) => p.created_at < startTime)
  return beforeKickoff[0] ?? null
}

function rangeToDays(range: ValidationRange): number {
  return range === '30d' ? 30 : 7
}

export async function getValidationRowsForExport(from: string, to: string): Promise<ValidationRow[]> {
  return getValidationRowsForDateRange(from, to)
}

export async function getValidationRowsForDateRange(
  from: string,
  to: string
): Promise<ValidationRow[]> {
  const fromDate = new Date(`${from}T00:00:00.000Z`)
  const toDate = new Date(`${to}T23:59:59.999Z`)
  const report = await buildValidationReportForDates(fromDate, toDate)
  return report.rows
}

async function buildValidationReportForDates(
  fromDate: Date,
  toDate: Date
): Promise<ValidationSummary> {
  const spanDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000)
  const range: ValidationRange = spanDays > 7 ? '30d' : '7d'

  const supabase = createServiceClient()
  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures')
    .select('*, sports!inner(slug)')
    .gte('start_time', fromDate.toISOString())
    .lte('start_time', toDate.toISOString())
    .order('start_time', { ascending: false })

  if (fixturesError) throw fixturesError

  return assembleReport(
    range,
    fromDate.toISOString().slice(0, 10),
    toDate.toISOString().slice(0, 10),
    fixtures ?? []
  )
}

export async function getValidationReport(range: ValidationRange): Promise<ValidationSummary> {
  const days = rangeToDays(range)
  const to = new Date()
  const from = new Date()
  from.setUTCDate(from.getUTCDate() - days)

  const supabase = createServiceClient()
  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures')
    .select('*, sports!inner(slug)')
    .gte('start_time', from.toISOString())
    .lte('start_time', to.toISOString())
    .order('start_time', { ascending: false })

  if (fixturesError) throw fixturesError

  return assembleReport(range, from.toISOString().slice(0, 10), to.toISOString().slice(0, 10), fixtures ?? [])
}

async function assembleReport(
  range: ValidationRange,
  from: string,
  to: string,
  fixtures: Array<Record<string, unknown>>
): Promise<ValidationSummary> {
  const fixtureRows = fixtures.map((f) => {
    const sports = f.sports as { slug: string } | { slug: string }[]
    const slug = Array.isArray(sports) ? sports[0]?.slug : sports.slug
    const { sports: _s, ...fixture } = f
    return { ...(fixture as Fixture), sport_slug: slug ?? 'unknown' }
  }) as FixtureWithSport[]

  if (fixtureRows.length === 0) {
    return emptyReport(range, from, to)
  }

  const fixtureIds = fixtureRows.map((f) => f.id)
  const supabase = createServiceClient()

  const [{ data: outcomes, error: outcomesError }, { data: predictions, error: predsError }] =
    await Promise.all([
      supabase.from('outcomes').select('*').in('fixture_id', fixtureIds),
      supabase
        .from('predictions')
        .select('*')
        .in('fixture_id', fixtureIds)
        .order('created_at', { ascending: false }),
    ])

  if (outcomesError) throw outcomesError
  if (predsError) throw predsError

  const outcomeByFixture = new Map(
    (outcomes ?? []).map((o) => [o.fixture_id as number, o.result_label as string])
  )
  const predsByFixture = new Map<number, PredictionRow[]>()
  for (const p of predictions ?? []) {
    const fid = p.fixture_id as number
    const list = predsByFixture.get(fid) ?? []
    list.push(p as PredictionRow)
    predsByFixture.set(fid, list)
  }

  const rows: ValidationRow[] = []
  const dailyMap = new Map<string, { total: number; hits: number }>()
  const byCategory = new Map<string, { total: number; hits: number }>()
  const bySport = new Map<string, { total: number; hits: number }>()

  let scorable = 0
  let hits = 0
  let misses = 0
  let errorSum = 0
  let errorCount = 0

  for (const fixture of fixtureRows) {
    const actual = outcomeByFixture.get(fixture.id)
    if (!actual) continue

    const preds = predsByFixture.get(fixture.id) ?? []
    const prediction = pickPriorDayPrediction(preds, fixture.start_time)
    if (!prediction) continue

    const evalResult = evaluatePrediction(prediction.probability, actual)
    const matchDay = fixture.start_time.slice(0, 10)

    rows.push({
      fixture_id: fixture.id,
      sport_slug: fixture.sport_slug,
      home_team: fixture.home_team,
      away_team: fixture.away_team,
      start_time: fixture.start_time,
      prediction_date: prediction.created_at.slice(0, 10),
      model_version: prediction.model_version,
      probability: prediction.probability,
      predicted_lean: evalResult.predicted_lean,
      decision_category: prediction.decision_category,
      confidence: prediction.confidence,
      actual_result: actual,
      hit: evalResult.hit,
      error_abs: evalResult.error_abs,
    })

    const dayBucket = dailyMap.get(matchDay) ?? { total: 0, hits: 0 }
    dayBucket.total += 1
    const catBucket = byCategory.get(prediction.decision_category) ?? { total: 0, hits: 0 }
    catBucket.total += 1
    const sportBucket = bySport.get(fixture.sport_slug) ?? { total: 0, hits: 0 }
    sportBucket.total += 1

    if (evalResult.hit === true) {
      hits += 1
      dayBucket.hits += 1
      catBucket.hits += 1
      sportBucket.hits += 1
    } else if (evalResult.hit === false) {
      misses += 1
    }

    if (evalResult.hit !== null) {
      scorable += 1
      if (evalResult.error_abs != null) {
        errorSum += evalResult.error_abs
        errorCount += 1
      }
    }

    dailyMap.set(matchDay, dayBucket)
    byCategory.set(prediction.decision_category, catBucket)
    bySport.set(fixture.sport_slug, sportBucket)
  }

  const mapRates = (m: Map<string, { total: number; hits: number }>) => {
    const out: Record<string, { total: number; hits: number; hit_rate: number | null }> = {}
    for (const [k, v] of m) {
      out[k] = {
        ...v,
        hit_rate: v.total > 0 ? v.hits / v.total : null,
      }
    }
    return out
  }

  const daily = Array.from(dailyMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, v]) => ({
      date,
      total: v.total,
      hits: v.hits,
      hit_rate: v.total > 0 ? v.hits / v.total : null,
    }))

  return {
    range,
    from,
    to,
    total_evaluated: rows.length,
    scorable,
    hits,
    misses,
    hit_rate: scorable > 0 ? hits / scorable : null,
    avg_error_abs: errorCount > 0 ? errorSum / errorCount : null,
    by_category: mapRates(byCategory),
    by_sport: mapRates(bySport),
    daily,
    rows,
    generated_at: new Date().toISOString(),
  }
}

function emptyReport(range: ValidationRange, from: string, to: string): ValidationSummary {
  return {
    range,
    from,
    to,
    total_evaluated: 0,
    scorable: 0,
    hits: 0,
    misses: 0,
    hit_rate: null,
    avg_error_abs: null,
    by_category: {},
    by_sport: {},
    daily: [],
    rows: [],
    generated_at: new Date().toISOString(),
  }
}

export async function persistValidationSnapshot(report: ValidationSummary): Promise<void> {
  const supabase = createServiceClient()
  const { daily, rows, ...summary } = report
  await supabase.from('admin_settings').upsert(
    {
      key: 'sports_validation_report',
      value: { ...summary, daily, row_count: rows.length },
    },
    { onConflict: 'key' }
  )
}
