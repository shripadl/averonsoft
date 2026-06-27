import type { ApiSportsFixtureItem } from '../providers/football/apiSports'
import {
  fetchFixturesByDate,
  mapApiSportsItemToFixtureFields,
  mapGoalsToResultLabel,
} from '../providers/football/apiSports'
import { getSportIdBySlug, upsertFixture } from '../db/fixtures'
import { upsertOutcome } from '../db/outcomes'
import { storeFootballFixtureMeta } from './football-meta'
import { isFinishedFootballStatus } from '../validation/outcome-labels'

export type FootballIngestResult = {
  upserted: number
}

export async function ingestFootballForDate(date: string): Promise<FootballIngestResult> {
  if (!process.env.FOOTBALL_API_KEY?.trim()) {
    console.warn('FOOTBALL_API_KEY is not set; skipping football ingestion')
    return { upserted: 0 }
  }

  let footballSportId: number
  try {
    footballSportId = await getSportIdBySlug('football')
  } catch (e) {
    console.error('Football ingestion: could not resolve sports.football id.', e)
    return { upserted: 0 }
  }

  let items: ApiSportsFixtureItem[]
  try {
    items = await fetchFixturesByDate(date)
  } catch (e) {
    console.error('Failed to fetch football fixtures from API-Sports', e)
    return { upserted: 0 }
  }

  let upserted = 0
  const INGEST_CHUNK = 25

  async function processItem(item: ApiSportsFixtureItem): Promise<boolean> {
    if (item?.fixture?.id == null) return false

    const fields = mapApiSportsItemToFixtureFields(item)
    const row = await upsertFixture({
      sport_id: footballSportId,
      ...fields,
    })

    try {
      await storeFootballFixtureMeta(row.id, item)
    } catch (e) {
      console.error('Failed to store football fixture meta', row.id, e)
    }

    if (isFinishedFootballStatus(fields.status)) {
      const label = mapGoalsToResultLabel(item.goals?.home, item.goals?.away)
      if (label) {
        await upsertOutcome({ fixture_id: row.id, result_label: label })
      }
    }
    return true
  }

  for (let i = 0; i < items.length; i += INGEST_CHUNK) {
    const chunk = items.slice(i, i + INGEST_CHUNK)
    const results = await Promise.all(chunk.map(processItem))
    upserted += results.filter(Boolean).length
  }
  return { upserted }
}
