import { getFinishedFixturesNeedingOutcomes } from '@/lib/sports-engine/db/fixtures'
import { upsertOutcome } from '@/lib/sports-engine/db/outcomes'
import {
  fetchFixtureById,
  mapGoalsToResultLabel,
} from '@/lib/sports-engine/providers/football/apiSports'

const FINISHED_FOOTBALL = new Set(['FT', 'AET', 'PEN', 'AWD', 'WO'])

function parseCricketResultLabel(
  home: string,
  away: string,
  status: string
): string | null {
  const s = status.toLowerCase()
  if (!s) return null
  if (s.includes('no result') || s.includes('abandon') || s.includes('cancelled')) {
    return 'no_result'
  }
  if (s.includes('tie') || s.includes('tied') || s.includes('draw')) {
    return 'draw'
  }
  if (!s.includes('won') && !s.includes('win') && !s.includes('finished') && !s.includes('ended')) {
    return null
  }

  const homeTokens = home.toLowerCase().split(/\s+/).filter((t) => t.length > 2)
  const awayTokens = away.toLowerCase().split(/\s+/).filter((t) => t.length > 2)

  const homeHit = homeTokens.some((t) => s.includes(t))
  const awayHit = awayTokens.some((t) => s.includes(t))

  if (homeHit && !awayHit) return 'home_win'
  if (awayHit && !homeHit) return 'away_win'
  return null
}

export async function resolveOutcomesForFinishedFixtures(): Promise<number> {
  const fixtures = await getFinishedFixturesNeedingOutcomes(45)
  let resolved = 0

  for (const row of fixtures) {
    let label: string | null = null

    if (row.sport_slug === 'football' && FINISHED_FOOTBALL.has(row.status.toUpperCase())) {
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
