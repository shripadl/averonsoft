import type { ApiSportsTeamStatistics } from '@/lib/sports-engine/providers/football/apiSports'
import type { RawStats } from '@/lib/sports-engine/prediction/featureExtractor'

function parseAverage(value: string | number | undefined): number {
  if (value == null) return 0
  const n = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

/** Last-five form string → average points per match (0–3 scale). */
export function formPointsPerGame(form: string | undefined): number {
  if (!form?.trim()) return 1.5
  const chars = form.trim().toUpperCase().slice(-5)
  if (!chars.length) return 1.5

  let pts = 0
  for (const c of chars) {
    if (c === 'W') pts += 3
    else if (c === 'D') pts += 1
  }
  return pts / chars.length
}

export function goalDifferencePerGame(stats: ApiSportsTeamStatistics | null): number {
  if (!stats?.goals) return 0
  const scored = parseAverage(stats.goals.for?.average?.total)
  const conceded = parseAverage(stats.goals.against?.average?.total)
  return scored - conceded
}

export type FootballTeamContext = {
  homeStats: ApiSportsTeamStatistics | null
  awayStats: ApiSportsTeamStatistics | null
  homeRank: number | null
  awayRank: number | null
}

/**
 * Home-relative feature vector for the logistic model (roughly −10…10 after normalisation).
 */
export function buildFootballRawStats(ctx: FootballTeamContext): RawStats {
  const homeForm = formPointsPerGame(ctx.homeStats?.form)
  const awayForm = formPointsPerGame(ctx.awayStats?.form)
  const recentFormScore = (homeForm - awayForm) * 3

  const homeGd = goalDifferencePerGame(ctx.homeStats)
  const awayGd = goalDifferencePerGame(ctx.awayStats)
  const goalDifferenceScore = (homeGd - awayGd) * 2.5

  let rankingScore = 0
  if (ctx.homeRank != null && ctx.awayRank != null) {
    rankingScore = ctx.awayRank - ctx.homeRank
  }

  const homeAdvantageScore = 2.5

  return clampRawStats({
    recentFormScore,
    goalDifferenceScore,
    rankingScore,
    homeAdvantageScore,
  })
}

function clampRawStats(raw: RawStats): RawStats {
  const clamp = (n: number | undefined) =>
    n == null ? undefined : Math.max(-10, Math.min(10, n))
  return {
    recentFormScore: clamp(raw.recentFormScore),
    goalDifferenceScore: clamp(raw.goalDifferenceScore),
    rankingScore: clamp(raw.rankingScore),
    homeAdvantageScore: clamp(raw.homeAdvantageScore),
  }
}

export function rawStatsToFeatureRows(
  raw: RawStats
): { feature_name: string; feature_value: number }[] {
  const rows: { feature_name: string; feature_value: number }[] = []
  for (const [name, value] of Object.entries(raw)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      rows.push({ feature_name: name, feature_value: value })
    }
  }
  return rows
}
