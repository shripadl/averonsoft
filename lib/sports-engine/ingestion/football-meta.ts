import type { ApiSportsFixtureItem } from '@/lib/sports-engine/providers/football/apiSports'
import { getStatsForFixture, upsertMetaStatsForFixture } from '@/lib/sports-engine/db/stats'

export const META_LEAGUE_ID = '_meta_league_id'
export const META_SEASON = '_meta_season'
export const META_HOME_TEAM_ID = '_meta_home_team_id'
export const META_AWAY_TEAM_ID = '_meta_away_team_id'

export function isMetaFeatureName(name: string): boolean {
  return name.startsWith('_meta_')
}

export async function storeFootballFixtureMeta(
  fixtureId: number,
  item: ApiSportsFixtureItem
): Promise<void> {
  const leagueId = item.league?.id
  const season = item.league?.season
  const homeId = item.teams?.home?.id
  const awayId = item.teams?.away?.id
  if (leagueId == null || season == null || homeId == null || awayId == null) return

  await upsertMetaStatsForFixture(fixtureId, [
    { feature_name: META_LEAGUE_ID, feature_value: leagueId },
    { feature_name: META_SEASON, feature_value: season },
    { feature_name: META_HOME_TEAM_ID, feature_value: homeId },
    { feature_name: META_AWAY_TEAM_ID, feature_value: awayId },
  ])
}

export type FootballFixtureMeta = {
  leagueId: number
  season: number
  homeTeamId: number
  awayTeamId: number
}

export async function readFootballFixtureMeta(
  fixtureId: number
): Promise<FootballFixtureMeta | null> {
  const rows = await getStatsForFixture(fixtureId)
  const map = new Map(rows.map((r) => [r.feature_name, r.feature_value]))
  const leagueId = map.get(META_LEAGUE_ID)
  const season = map.get(META_SEASON)
  const homeTeamId = map.get(META_HOME_TEAM_ID)
  const awayTeamId = map.get(META_AWAY_TEAM_ID)
  if (
    leagueId == null ||
    season == null ||
    homeTeamId == null ||
    awayTeamId == null
  ) {
    return null
  }
  return {
    leagueId,
    season,
    homeTeamId,
    awayTeamId,
  }
}
