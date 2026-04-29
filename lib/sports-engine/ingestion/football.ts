import {
  fetchFixturesByDate,
  mapApiSportsItemToFixtureFields,
} from '../providers/football/apiSports'
import { getSportIdBySlug, upsertFixture } from '../db/fixtures'

export async function ingestFootballForDate(date: string): Promise<number> {
  if (!process.env.FOOTBALL_API_KEY?.trim()) {
    console.warn('FOOTBALL_API_KEY is not set; skipping football ingestion')
    return 0
  }

  let footballSportId: number
  try {
    footballSportId = await getSportIdBySlug('football')
  } catch (e) {
    console.error('Football ingestion: could not resolve sports.football id.', e)
    return 0
  }

  let items
  try {
    items = await fetchFixturesByDate(date)
  } catch (e) {
    console.error('Failed to fetch football fixtures from API-Sports', e)
    return 0
  }

  let upserted = 0
  for (const item of items) {
    if (item?.fixture?.id == null) continue

    const fields = mapApiSportsItemToFixtureFields(item)
    await upsertFixture({
      sport_id: footballSportId,
      ...fields,
    })
    upserted += 1
  }
  return upserted
}
