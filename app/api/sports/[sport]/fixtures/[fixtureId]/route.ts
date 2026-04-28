import { NextResponse } from 'next/server'
import { getFixtureDetail } from '@/lib/sports-engine/get-fixture-detail'
import { getSportsHistoryPublicVisible } from '@/lib/tool-settings'

type Params = {
  params: Promise<{ sport: string; fixtureId: string }>
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { sport, fixtureId } = await params
    const id = Number(fixtureId)
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Invalid fixtureId' }, { status: 400 })
    }

    const includeHistoryResults = await getSportsHistoryPublicVisible()
    const detail = await getFixtureDetail(sport, id, { includeHistoryResults })
    if (!detail) {
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 })
    }

    return NextResponse.json(detail)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load fixture detail' }, { status: 500 })
  }
}
