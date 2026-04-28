/**
 * API-Sports (API-FOOTBALL) direct API — https://www.api-sports.io/documentation/football/v3
 *
 * Base URL: https://v3.football.api-sports.io (override with `FOOTBALL_API_BASE_URL`)
 * Auth: `x-apisports-key: <FOOTBALL_API_KEY>` — not RapidAPI (no X-RapidAPI-* headers).
 *
 * Add to `.env.local`, for example:
 *   FOOTBALL_API_BASE_URL=https://v3.football.api-sports.io
 *   FOOTBALL_API_KEY=your_api_sports_key_here
 */

const DEFAULT_BASE_URL = 'https://v3.football.api-sports.io'

export type ApiSportsFixtureItem = {
  fixture: {
    id: number
    date: string
    status: {
      short: string
      long?: string
    }
  }
  teams: {
    home: { name: string }
    away: { name: string }
  }
}

export type ApiSportsFixturesEnvelope<T> = {
  get: string
  parameters?: Record<string, unknown>
  errors: unknown
  results?: number
  paging?: { current?: number; total?: number }
  response: T
}

function getBaseUrl(): string {
  return (process.env.FOOTBALL_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '')
}

function getAuthHeaders(): HeadersInit {
  return {
    'x-apisports-key': process.env.FOOTBALL_API_KEY ?? '',
  }
}

function hasApiSportsErrors(errors: unknown): boolean {
  if (errors == null) return false
  if (Array.isArray(errors)) return errors.length > 0
  if (typeof errors === 'object') return Object.keys(errors as Record<string, unknown>).length > 0
  return Boolean(errors)
}

async function fetchFixturesJson<T>(query: string): Promise<ApiSportsFixturesEnvelope<T>> {
  const path = query.startsWith('?') ? `/fixtures${query}` : `/fixtures?${query}`
  const url = `${getBaseUrl()}${path}`

  const res = await fetch(url, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API-Sports fixtures request failed (${res.status}): ${text}`)
  }

  return (await res.json()) as ApiSportsFixturesEnvelope<T>
}

/** Today’s fixtures (or any single calendar day), `date=YYYY-MM-DD`. */
export async function fetchFixturesByDate(date: string): Promise<ApiSportsFixtureItem[]> {
  const formatted = date.trim()
  const json = await fetchFixturesJson<ApiSportsFixtureItem[]>(
    `date=${encodeURIComponent(formatted)}`
  )

  if (hasApiSportsErrors(json.errors)) {
    console.error('API-Sports errors (fixtures by date):', json.errors)
    return []
  }

  const list = json.response
  return Array.isArray(list) ? list : []
}

/**
 * Upcoming fixtures for a league/season (e.g. next 20).
 * Example: `/fixtures?league=39&season=2024&next=20`
 */
export async function fetchUpcomingFixtures(
  league: number,
  season: number,
  next: number
): Promise<ApiSportsFixtureItem[]> {
  const q = `league=${league}&season=${season}&next=${next}`
  const json = await fetchFixturesJson<ApiSportsFixtureItem[]>(q)

  if (hasApiSportsErrors(json.errors)) {
    console.error('API-Sports errors (upcoming fixtures):', json.errors)
    return []
  }

  const list = json.response
  return Array.isArray(list) ? list : []
}

/** All live fixtures (`live=all`). */
export async function fetchLiveFixtures(): Promise<ApiSportsFixtureItem[]> {
  const json = await fetchFixturesJson<ApiSportsFixtureItem[]>('live=all')

  if (hasApiSportsErrors(json.errors)) {
    console.error('API-Sports errors (live fixtures):', json.errors)
    return []
  }

  const list = json.response
  return Array.isArray(list) ? list : []
}

/** Map one API-Sports `response[]` element to `upsertFixture` input (sport_id must be set by caller). */
export function mapApiSportsItemToFixtureFields(item: ApiSportsFixtureItem): {
  external_id: string
  home_team: string
  away_team: string
  start_time: string
  status: string
} {
  return {
    external_id: String(item.fixture.id),
    home_team: item.teams?.home?.name ?? 'Home',
    away_team: item.teams?.away?.name ?? 'Away',
    start_time: item.fixture.date,
    status: item.fixture.status?.short ?? 'NS',
  }
}
