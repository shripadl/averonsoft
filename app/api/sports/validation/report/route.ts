import { NextRequest, NextResponse } from 'next/server'
import {
  getValidationReport,
  type ValidationRange,
} from '@/lib/sports-engine/validation/get-validation-report'

export async function GET(request: NextRequest) {
  const rangeParam = request.nextUrl.searchParams.get('range') ?? '7d'
  const range: ValidationRange = rangeParam === '30d' ? '30d' : '7d'

  try {
    const report = await getValidationReport(range)
    return NextResponse.json(report)
  } catch (e) {
    console.error('Validation report failed:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to build report' },
      { status: 500 }
    )
  }
}
