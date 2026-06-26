import type { Fixture } from '@/lib/sports-engine/db/fixtures'
import { replaceStatsForFixture } from '@/lib/sports-engine/db/stats'
import {
  buildFootballRawStats,
  rawStatsToFeatureRows,
} from '@/lib/sports-engine/ingestion/football-features'
import {
  fetchFixtureById,
  fetchLeagueStandings,
  fetchTeamStatistics,
  type ApiSportsTeamStatistics,
} from '@/lib/sports-engine/providers/football/apiSports'

const teamStatsCache = new Map<string, ApiSportsTeamStatistics | null>()
const standingsCache = new Map<string, Map<number, number>>()

export function clearFootballStatsCaches(): void {
  teamStatsCache.clear()
  standingsCache.clear()
}

function teamCacheKey(teamId: number, leagueId: number, season: number): string {
  return `${teamId}:${leagueId}:${season}`
}

function standingsCacheKey(leagueId: number, season: number): string {
  return `${leagueId}:${season}`
}

async function getTeamStatisticsCached(
  teamId: number,
  leagueId: number,
  season: number
): Promise<ApiSportsTeamStatistics | null> {
  const key = teamCacheKey(teamId, leagueId, season)
  if (teamStatsCache.has(key)) return teamStatsCache.get(key) ?? null

  const stats = await fetchTeamStatistics(teamId, leagueId, season)
  teamStatsCache.set(key, stats)
  return stats
}

async function getStandingsCached(
  leagueId: number,
  season: number
): Promise<Map<number, number>> {
  const key = standingsCacheKey(leagueId, season)
  if (standingsCache.has(key)) return standingsCache.get(key)!

  const ranks = await fetchLeagueStandings(leagueId, season)
  standingsCache.set(key, ranks)
  return ranks
}

/**
 * Pull API-Sports form, goal averages, and league rank; persist to fixture_stats.
 * Returns true when real stats were written (false → pipeline may fall back to v1).
 */
export async function enrichFootballFixtureStats(fixture: Fixture): Promise<boolean> {
  if (!process.env.FOOTBALL_API_KEY?.trim()) return false

  const detail = await fetchFixtureById(fixture.external_id)
  if (!detail?.league?.id || detail.league.season == null) return false

  const homeId = detail.teams.home.id
  const awayId = detail.teams.away.id
  if (homeId == null || awayId == null) return false

  const leagueId = detail.league.id
  const season = detail.league.season

  const [homeStats, awayStats, standings] = await Promise.all([
    getTeamStatisticsCached(homeId, leagueId, season),
    getTeamStatisticsCached(awayId, leagueId, season),
    getStandingsCached(leagueId, season),
  ])

  if (!homeStats && !awayStats) return false

  const raw = buildFootballRawStats({
    homeStats,
    awayStats,
    homeRank: standings.get(homeId) ?? null,
    awayRank: standings.get(awayId) ?? null,
  })

  const rows = rawStatsToFeatureRows(raw)
  if (rows.length === 0) return false

  await replaceStatsForFixture(Number(fixture.id), rows)
  return true
}
