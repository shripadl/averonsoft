import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import {
  mergeAndPersistReport,
  runFinalizePhase,
} from '@/lib/sports-engine/ingestion/run-phases'

/** Resolve outcomes and refresh validator snapshot. */
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const finalize = await runFinalizePhase()
    const report = await mergeAndPersistReport(finalize)
    return NextResponse.json({ phase: 'finalize', ...report })
  } catch (e) {
    console.error('Finalize phase failed:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Finalize failed' },
      { status: 500 }
    )
  }
}
