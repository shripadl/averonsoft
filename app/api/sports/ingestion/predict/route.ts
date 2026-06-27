import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import {
  mergeAndPersistReport,
  runPredictionPhase,
} from '@/lib/sports-engine/ingestion/run-phases'

/** Generate predictions for today's fixtures (separate step to avoid timeout). */
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const predictions = await runPredictionPhase()
    const report = await mergeAndPersistReport(predictions)
    return NextResponse.json({ phase: 'predict', ...report })
  } catch (e) {
    console.error('Prediction phase failed:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Prediction failed' },
      { status: 500 }
    )
  }
}
