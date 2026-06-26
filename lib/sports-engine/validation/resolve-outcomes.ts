import { getFinishedFixturesNeedingOutcomes } from '@/lib/sports-engine/db/fixtures'
import { upsertOutcome } from '@/lib/sports-engine/db/outcomes'
import {
  fetchFixtureById,
  mapGoalsToResultLabel,
} from '@/lib/sports-engine/providers/football/apiSports'
import {
  isFinishedFootballStatus,
  parseCricketResultLabel,
} from '@/lib/sports-engine/validation/outcome-labels'

export async function resolveOutcomesForFinishedFixtures(): Promise<number> {
  const fixtures = await getFinishedFixturesNeedingOutcomes(45)
  let resolved = 0

  for (const row of fixtures) {
    let label: string | null = null

    if (row.sport_slug === 'football' && isFinishedFootballStatus(row.status)) {
      try {
        const item = await fetchFixtureById(row.external_id)
        label = item ? mapGoalsToResultLabel(item.goals?.home, item.goals?.away) : null
      } catch (e) {
        console.error('Football outcome resolve failed for fixture', row.id, e)
      }
    } else if (row.sport_slug === 'cricket') {
      label = parseCricketResultLabel(row.home_team, row.away_team, row.status)
    }

    if (!label) continue

    await upsertOutcome({ fixture_id: row.id, result_label: label })
    resolved += 1
  }

  return resolved
}
