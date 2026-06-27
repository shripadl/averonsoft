import { ingestCricketFixturesForToday } from '@/lib/sports-engine/ingestion/cricket'
import { ingestFootballForDate } from '@/lib/sports-engine/ingestion/football'
import { runPredictionPipelineForToday } from '@/lib/sports-engine/run-prediction-pipeline'
import {
  getValidationReport,
  persistValidationSnapshot,
} from '@/lib/sports-engine/validation/get-validation-report'
import { resolveOutcomesForFinishedFixtures } from '@/lib/sports-engine/validation/resolve-outcomes'
import { createServiceClient } from '@/lib/supabase/server'

export type IngestionReport = {
  status: 'ok'
  date: string
  football_upserted: number
  cricket_upserted: number
  predictions_generated: number
  football_predictions: number
  cricket_predictions: number
  prediction_error: string | null
  outcomes_resolved: number
  validation_error: string | null
  generated_at: string
}

function yesterdayYmd(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().split('T')[0]!
}

function todayYmd(): string {
  return new Date().toISOString().split('T')[0]!
}

export async function loadIngestionReport(): Promise<Partial<IngestionReport>> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'sports_last_ingestion_run')
      .maybeSingle()
    return (data?.value as Partial<IngestionReport> | null) ?? {}
  } catch {
    return {}
  }
}

export async function persistIngestionReport(report: IngestionReport): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('admin_settings').upsert(
    {
      key: 'sports_last_ingestion_run',
      value: report,
    },
    { onConflict: 'key' }
  )
}

export async function runIngestionPhase(): Promise<Pick<IngestionReport, 'date' | 'football_upserted' | 'cricket_upserted'>> {
  const today = todayYmd()
  const yesterday = yesterdayYmd()

  const [footballToday, footballYesterday, cricketUpserted] = await Promise.all([
    ingestFootballForDate(today),
    ingestFootballForDate(yesterday),
    ingestCricketFixturesForToday(),
  ])

  return {
    date: today,
    football_upserted: footballToday.upserted + footballYesterday.upserted,
    cricket_upserted: cricketUpserted,
  }
}

export async function runPredictionPhase(): Promise<
  Pick<
    IngestionReport,
    'predictions_generated' | 'football_predictions' | 'cricket_predictions' | 'prediction_error'
  >
> {
  try {
    const preds = await runPredictionPipelineForToday()
    return {
      predictions_generated: preds.length,
      football_predictions: preds.filter((p) => p.sport === 'football').length,
      cricket_predictions: preds.filter((p) => p.sport === 'cricket').length,
      prediction_error: null,
    }
  } catch (e) {
    console.error('Prediction pipeline failed:', e)
    return {
      predictions_generated: 0,
      football_predictions: 0,
      cricket_predictions: 0,
      prediction_error: e instanceof Error ? e.message : 'unknown',
    }
  }
}

export async function runFinalizePhase(): Promise<
  Pick<IngestionReport, 'outcomes_resolved' | 'validation_error'>
> {
  try {
    const outcomesResolved = await resolveOutcomesForFinishedFixtures()
    const validationReport = await getValidationReport('7d')
    await persistValidationSnapshot(validationReport)
    return { outcomes_resolved: outcomesResolved, validation_error: null }
  } catch (e) {
    console.error('Outcome resolution / validation failed:', e)
    return {
      outcomes_resolved: 0,
      validation_error: e instanceof Error ? e.message : 'unknown',
    }
  }
}

export async function mergeAndPersistReport(
  partial: Partial<IngestionReport>
): Promise<IngestionReport> {
  const existing = await loadIngestionReport()
  const report: IngestionReport = {
    status: 'ok',
    date: partial.date ?? existing.date ?? todayYmd(),
    football_upserted: partial.football_upserted ?? existing.football_upserted ?? 0,
    cricket_upserted: partial.cricket_upserted ?? existing.cricket_upserted ?? 0,
    predictions_generated: partial.predictions_generated ?? existing.predictions_generated ?? 0,
    football_predictions: partial.football_predictions ?? existing.football_predictions ?? 0,
    cricket_predictions: partial.cricket_predictions ?? existing.cricket_predictions ?? 0,
    prediction_error: partial.prediction_error ?? existing.prediction_error ?? null,
    outcomes_resolved: partial.outcomes_resolved ?? existing.outcomes_resolved ?? 0,
    validation_error: partial.validation_error ?? existing.validation_error ?? null,
    generated_at: new Date().toISOString(),
  }
  await persistIngestionReport(report)
  return report
}
