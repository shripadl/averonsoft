import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import { ingestCricketFixturesForToday } from '@/lib/sports-engine/ingestion/cricket'
import { ingestFootballForDate } from '@/lib/sports-engine/ingestion/football'
import { runPredictionPipelineForToday } from '@/lib/sports-engine/run-prediction-pipeline'
import {
  getValidationReport,
  persistValidationSnapshot,
} from '@/lib/sports-engine/validation/get-validation-report'
import { resolveOutcomesForFinishedFixtures } from '@/lib/sports-engine/validation/resolve-outcomes'
import { createServiceClient } from '@/lib/supabase/server'

function yesterdayYmd(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().split('T')[0]!
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const today = new Date().toISOString().split('T')[0]
  const yesterday = yesterdayYmd()

  const [footballToday, footballYesterday, cricketUpserted] = await Promise.all([
    ingestFootballForDate(today),
    ingestFootballForDate(yesterday),
    ingestCricketFixturesForToday(),
  ])
  const footballUpserted = footballToday + footballYesterday

  let predictionsCount = 0
  let footballPredictions = 0
  let cricketPredictions = 0
  let predictionError: string | null = null
  try {
    const preds = await runPredictionPipelineForToday()
    predictionsCount = preds.length
    footballPredictions = preds.filter((p) => p.sport === 'football').length
    cricketPredictions = preds.filter((p) => p.sport === 'cricket').length
  } catch (e) {
    console.error('Prediction pipeline after ingestion failed:', e)
    predictionError = e instanceof Error ? e.message : 'unknown'
  }

  let outcomesResolved = 0
  let validationError: string | null = null
  try {
    outcomesResolved = await resolveOutcomesForFinishedFixtures()
    const validationReport = await getValidationReport('7d')
    await persistValidationSnapshot(validationReport)
  } catch (e) {
    console.error('Outcome resolution / validation failed:', e)
    validationError = e instanceof Error ? e.message : 'unknown'
  }

  const report = {
    status: 'ok',
    date: today,
    football_upserted: footballUpserted,
    cricket_upserted: cricketUpserted,
    predictions_generated: predictionsCount,
    football_predictions: footballPredictions,
    cricket_predictions: cricketPredictions,
    prediction_error: predictionError,
    outcomes_resolved: outcomesResolved,
    validation_error: validationError,
    generated_at: new Date().toISOString(),
  }

  try {
    const supabase = createServiceClient()
    await supabase.from('admin_settings').upsert(
      {
        key: 'sports_last_ingestion_run',
        value: report,
      },
      { onConflict: 'key' }
    )
  } catch (e) {
    console.error('Failed to persist sports_last_ingestion_run:', e)
  }

  return NextResponse.json(report)
}
