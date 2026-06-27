import type { Fixture } from '@/lib/sports-engine/db/fixtures'
import { getTodayFixturesBySportSlug } from '@/lib/sports-engine/db/fixtures'
import { getStatsForFixture, replaceModelStatsForFixture } from '@/lib/sports-engine/db/stats'
import {
  buildFootballRawStats,
  rawStatsToFeatureRows,
} from '@/lib/sports-engine/ingestion/football-features'
import { readFootballFixtureMeta } from '@/lib/sports-engine/ingestion/football-meta'
import {
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
 * Pull API-Sports form, goal averages, and league rank using stored fixture meta (no per-fixture fixture fetch).
 */
export async function enrichFootballFixtureStats(fixture: Fixture): Promise<boolean> {
  if (!process.env.FOOTBALL_API_KEY?.trim()) return false

  const meta = await readFootballFixtureMeta(Number(fixture.id))
  if (!meta) return false

  const [homeStats, awayStats, standings] = await Promise.all([
    getTeamStatisticsCached(meta.homeTeamId, meta.leagueId, meta.season),
    getTeamStatisticsCached(meta.awayTeamId, meta.leagueId, meta.season),
    getStandingsCached(meta.leagueId, meta.season),
  ])

  if (!homeStats && !awayStats) return false

  const raw = buildFootballRawStats({
    homeStats,
    awayStats,
    homeRank: standings.get(meta.homeTeamId) ?? null,
    awayRank: standings.get(meta.awayTeamId) ?? null,
  })

  const rows = rawStatsToFeatureRows(raw)
  if (rows.length === 0) return false

  await replaceModelStatsForFixture(Number(fixture.id), rows)
  return true
}

export function fixtureNeedsStatsEnrichment(
  statRows: { feature_name: string }[]
): boolean {
  return !statRows.some((r) => r.feature_name === 'homeAdvantageScore')
}

/** Enrich up to `limit` today's football fixtures that lack v2 stats (for batched cron). */
export async function enrichFootballStatsBatch(
  limit: number
): Promise<{ enriched: number; fixtureIds: number[] }> {
  const fixtures = await getTodayFixturesBySportSlug('football')
  const fixtureIds: number[] = []

  for (const fixture of fixtures) {
    if (fixtureIds.length >= limit) break
    const statRows = await getStatsForFixture(Number(fixture.id))
    if (!fixtureNeedsStatsEnrichment(statRows)) continue
    try {
      const ok = await enrichFootballFixtureStats(fixture)
      if (ok) fixtureIds.push(Number(fixture.id))
    } catch (e) {
      console.error('Batch football stats enrichment failed for', fixture.id, e)
    }
  }

  return { enriched: fixtureIds.length, fixtureIds }
}
