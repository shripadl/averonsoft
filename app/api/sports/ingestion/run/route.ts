import { NextResponse } from 'next/server'
import { ingestCricketFixturesForToday } from '@/lib/sports-engine/ingestion/cricket'
import { ingestFootballForDate } from '@/lib/sports-engine/ingestion/football'
import { runPredictionPipelineForToday } from '@/lib/sports-engine/run-prediction-pipeline'

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  await Promise.all([ingestFootballForDate(today), ingestCricketFixturesForToday()])

  let predictionsCount = 0
  try {
    const preds = await runPredictionPipelineForToday()
    predictionsCount = preds.length
  } catch (e) {
    console.error('Prediction pipeline after ingestion failed:', e)
  }

  return NextResponse.json({
    status: 'ok',
    date: today,
    predictions_generated: predictionsCount,
  })
}
