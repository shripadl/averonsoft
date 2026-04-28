import { NextResponse } from 'next/server'
import {
  PREDICTION_MODEL_VERSION,
  runPredictionPipelineForToday,
} from '@/lib/sports-engine/run-prediction-pipeline'

export async function GET() {
  try {
    const predictions = await runPredictionPipelineForToday()

    return NextResponse.json({
      status: 'ok',
      model_version: PREDICTION_MODEL_VERSION,
      predictions,
    })
  } catch (e) {
    console.error('Prediction runner failed:', e)
    return NextResponse.json(
      { status: 'error', message: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
