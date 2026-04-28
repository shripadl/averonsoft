import { NextResponse } from 'next/server'
import {
  buildSportsDataMeta,
  getTodayFixturesWithPredictions,
} from '@/lib/sports-engine/get-today-with-predictions'

export async function GET() {
  try {
    const entries = await getTodayFixturesWithPredictions('cricket')
    const meta = buildSportsDataMeta(entries)
    return NextResponse.json({ entries, meta })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load fixtures' }, { status: 500 })
  }
}
