import { NextResponse } from 'next/server'
import { ingestCricketFixturesForToday } from '@/lib/sports-engine/ingestion/cricket'
import { ingestFootballForDate } from '@/lib/sports-engine/ingestion/football'
import { runPredictionPipelineForToday } from '@/lib/sports-engine/run-prediction-pipeline'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  const [footballUpserted, cricketUpserted] = await Promise.all([
    ingestFootballForDate(today),
    ingestCricketFixturesForToday(),
  ])

  let predictionsCount = 0
  let predictionError: string | null = null
  try {
    const preds = await runPredictionPipelineForToday()
    predictionsCount = preds.length
  } catch (e) {
    console.error('Prediction pipeline after ingestion failed:', e)
    predictionError = e instanceof Error ? e.message : 'unknown'
  }

  const report = {
    status: 'ok',
    date: today,
    football_upserted: footballUpserted,
    cricket_upserted: cricketUpserted,
    predictions_generated: predictionsCount,
    prediction_error: predictionError,
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
