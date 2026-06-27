import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import {
  mergeAndPersistReport,
  runIngestionPhase,
} from '@/lib/sports-engine/ingestion/run-phases'

/** Fetch and upsert today's fixtures only (kept under Vercel 60s limit). */
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const ingest = await runIngestionPhase()
    const report = await mergeAndPersistReport(ingest)
    return NextResponse.json({ phase: 'ingest', ...report })
  } catch (e) {
    console.error('Ingestion phase failed:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Ingestion failed' },
      { status: 500 }
    )
  }
}
