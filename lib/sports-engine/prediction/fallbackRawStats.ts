import type { Fixture } from '@/lib/sports-engine/db/fixtures'
import type { RawStats } from './featureExtractor'

/**
 * Simple string hash → stable integer (deterministic per fixture).
 */
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i)! | 0
  }
  return Math.abs(h)
}

/**
 * When `fixture_stats` has no rows, the logistic model receives an empty feature vector → score 0 → 50% for every fixture.
 * This derives deterministic pseudo-features from fixture identity so probabilities vary until real stats are ingested.
 */
export function rawStatsFallbackFromFixture(fixture: Fixture): RawStats {
  const seed = hashString(
    `${fixture.sport_id}:${fixture.external_id}:${fixture.home_team}:${fixture.away_team}`
  )
  const spread = (mul: number) => ((Math.floor(seed / mul) % 41) - 20) / 4 // roughly -5 .. 5
  return {
    recentFormScore: spread(1),
    goalDifferenceScore: spread(17),
    rankingScore: spread(97),
  }
}
