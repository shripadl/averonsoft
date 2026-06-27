import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import {
  mergeAndPersistReport,
  runFinalizePhase,
  runIngestionPhase,
  runPredictionPhase,
} from '@/lib/sports-engine/ingestion/run-phases'

/**
 * Runs all ingestion phases in one request (may exceed 60s on large fixture days).
 * GitHub Actions should call /ingest, /predict, and /finalize separately.
 */
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ingest = await runIngestionPhase()
  await mergeAndPersistReport(ingest)

  const predictions = await runPredictionPhase()
  await mergeAndPersistReport(predictions)

  const finalize = await runFinalizePhase()
  const report = await mergeAndPersistReport(finalize)

  return NextResponse.json({ phase: 'all', ...report })
}
