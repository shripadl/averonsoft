import { NextRequest, NextResponse } from 'next/server'
import { getValidationRowsForDateRange } from '@/lib/sports-engine/validation/get-validation-report'

function csvEscape(value: string | number | boolean | null | undefined): string {
  const s = value == null ? '' : String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(request: NextRequest) {
  const from =
    request.nextUrl.searchParams.get('from') ??
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const to = request.nextUrl.searchParams.get('to') ?? new Date().toISOString().slice(0, 10)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: 'Invalid from/to date (use YYYY-MM-DD)' }, { status: 400 })
  }

  try {
    const rows = await getValidationRowsForDateRange(from, to)
    const header = [
      'fixture_id',
      'sport',
      'home_team',
      'away_team',
      'start_time',
      'prediction_date',
      'model_version',
      'probability',
      'predicted_lean',
      'decision_category',
      'confidence',
      'actual_result',
      'hit',
      'error_abs',
    ]

    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.fixture_id,
          r.sport_slug,
          r.home_team,
          r.away_team,
          r.start_time,
          r.prediction_date,
          r.model_version,
          r.probability,
          r.predicted_lean,
          r.decision_category,
          r.confidence,
          r.actual_result,
          r.hit,
          r.error_abs,
        ]
          .map(csvEscape)
          .join(',')
      ),
    ]

    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sports-validation-${from}-to-${to}.csv"`,
      },
    })
  } catch (e) {
    console.error('Validation CSV export failed:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Export failed' },
      { status: 500 }
    )
  }
}
