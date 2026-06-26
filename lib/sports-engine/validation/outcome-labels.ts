const FINISHED_FOOTBALL = new Set(['FT', 'AET', 'PEN', 'AWD', 'WO'])

export function isFinishedFootballStatus(status: string): boolean {
  return FINISHED_FOOTBALL.has(status.toUpperCase())
}

export function parseCricketResultLabel(
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
  if (
    !s.includes('won') &&
    !s.includes('win') &&
    !s.includes('finished') &&
    !s.includes('ended')
  ) {
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
