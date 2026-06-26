import {
  fetchFixturesByDate,
  mapApiSportsItemToFixtureFields,
  mapGoalsToResultLabel,
} from '../providers/football/apiSports'
import { getSportIdBySlug, upsertFixture } from '../db/fixtures'
import { upsertOutcome } from '../db/outcomes'
import { isFinishedFootballStatus } from '../validation/outcome-labels'

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
    const row = await upsertFixture({
      sport_id: footballSportId,
      ...fields,
    })
    upserted += 1

    if (isFinishedFootballStatus(fields.status)) {
      const label = mapGoalsToResultLabel(item.goals?.home, item.goals?.away)
      if (label) {
        await upsertOutcome({ fixture_id: row.id, result_label: label })
      }
    }
  }
  return upserted
}
