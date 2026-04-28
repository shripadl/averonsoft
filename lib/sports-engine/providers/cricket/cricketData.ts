/**
 * CricketData.org / cricapi.com v1 — https://www.cricapi.com/
 *
 * Responses vary: `data` (newer) or `matches` (legacy npm / older docs).
 * `status` may be `"success"`, boolean `true`, or omitted when payload is present.
 */

import { getSportIdBySlug, upsertFixture } from '@/lib/sports-engine/db/fixtures'

const DEFAULT_BASE_URL = 'https://api.cricapi.com/v1'

/** Matches both documented samples and legacy cricapi npm payloads. */
type CricapiMatchRaw = {
  id?: string | number
  unique_id?: string | number
  name?: string
  teams?: string[]
  'team-1'?: string
  'team-2'?: string
  date?: string
  dateTimeGMT?: string
  status?: string | number | boolean
}

type CricapiMatchesResponse = {
  status?: string | boolean | number
  data?: CricapiMatchRaw[] | Record<string, unknown>
  matches?: CricapiMatchRaw[]
  response?: CricapiMatchRaw[]
  message?: string
  reason?: string
}

function getBaseUrl(): string {
  return (process.env.CRICKET_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '')
}

function matchDateYmd(dateStr: string): string {
  const trimmed = dateStr.trim()
  if (trimmed.includes('T')) return trimmed.split('T')[0]!
  return trimmed.slice(0, 10)
}

/** Same calendar-day window as `getTodayFixturesBySportSlug` (local server timezone). */
function isInLocalTodayWindow(iso: string): boolean {
  const t = new Date(iso).getTime()
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return t >= start.getTime() && t < end.getTime()
}

function localTodayYmd(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseHomeAway(item: CricapiMatchRaw): { home: string; away: string } {
  const t1 = item['team-1']
  const t2 = item['team-2']
  if (t1?.trim() && t2?.trim()) {
    return { home: t1.trim(), away: t2.trim() }
  }
  const teams = item.teams
  if (Array.isArray(teams) && teams.length >= 2) {
    return { home: teams[0]!, away: teams[1]! }
  }
  const name = item.name ?? ''
  const parts = name.split(/\s+vs\.?\s+/i)
  if (parts.length >= 2) {
    return { home: parts[0]!.trim(), away: parts[1]!.trim() }
  }
  return { home: 'Home', away: 'Away' }
}

function resolveExternalId(item: CricapiMatchRaw): string | null {
  const raw = item.id ?? item.unique_id
  if (raw == null || raw === '') return null
  return String(raw)
}

/**
 * Prefer `dateTimeGMT` (actual start) when present; else `date`.
 */
function toStartTimeIso(item: CricapiMatchRaw): string {
  const raw = item.dateTimeGMT ?? item.date
  if (!raw?.trim()) {
    return new Date().toISOString()
  }
  const parsed = new Date(raw.trim())
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString()
  }
  const ymd = matchDateYmd(raw)
  const fallback = new Date(`${ymd}T12:00:00.000Z`)
  return Number.isNaN(fallback.getTime()) ? new Date().toISOString() : fallback.toISOString()
}

function isMatchForToday(item: CricapiMatchRaw, startIso: string): boolean {
  if (isInLocalTodayWindow(startIso)) return true
  const raw = item.dateTimeGMT ?? item.date
  if (raw && matchDateYmd(raw) === localTodayYmd()) return true
  return false
}

function normalizeStatus(s: unknown): string {
  if (s == null) return 'scheduled'
  if (typeof s === 'string') return s.trim() || 'scheduled'
  if (typeof s === 'boolean') return s ? 'live' : 'scheduled'
  return String(s)
}

function asArray(v: unknown): CricapiMatchRaw[] | null {
  return Array.isArray(v) ? (v as CricapiMatchRaw[]) : null
}

/**
 * CricAPI payloads differ: top-level `data`, `matches`, nested `data.matches`, or `response`.
 */
function extractMatchList(json: CricapiMatchesResponse & Record<string, unknown>): CricapiMatchRaw[] {
  const d = json.data
  const fromData = asArray(d)
  if (fromData) return fromData
  if (d && typeof d === 'object') {
    const inner = (d as Record<string, unknown>).matches ?? (d as Record<string, unknown>).list
    const innerArr = asArray(inner)
    if (innerArr) return innerArr
  }
  const fromMatches = asArray(json.matches)
  if (fromMatches) return fromMatches
  const fromResponse = asArray(json.response)
  if (fromResponse) return fromResponse
  return []
}

/**
 * Fetch matches from CricketData.org, map to fixtures, upsert today’s matches only.
 */
export async function ingestCricketFixturesForToday(): Promise<void> {
  const apiKey = process.env.CRICKET_API_KEY?.trim()
  if (!apiKey) {
    console.warn('CRICKET_API_KEY is not set; skipping cricket ingestion')
    return
  }

  const base = getBaseUrl()
  const url = `${base}/matches?apikey=${encodeURIComponent(apiKey)}`

  const res = await fetch(url, {
    headers: {
      apikey: apiKey,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    console.error('CricketData matches request failed', res.status, await res.text())
    return
  }

  const json = (await res.json()) as CricapiMatchesResponse & Record<string, unknown>
  const list = extractMatchList(json)

  const failed =
    typeof json.status === 'string' &&
    ['failure', 'error'].includes(json.status.toLowerCase()) &&
    list.length === 0
  if (failed) {
    console.error(
      'CricketData API reported failure:',
      json.status,
      json.message ?? json.reason ?? '(no matches in response)'
    )
    return
  }

  if (list.length === 0) {
    console.warn(
      'CricketData: empty match list (check API key, quota, and response shape). status=',
      json.status
    )
    return
  }

  let cricketSportId: number
  try {
    cricketSportId = await getSportIdBySlug('cricket')
  } catch (e) {
    console.error(
      'Cricket ingestion: no `sports` row for slug "cricket". Apply supabase/sports-engine-schema.sql seed.',
      e
    )
    return
  }

  const tryUpsert = async (item: CricapiMatchRaw, requireToday: boolean) => {
    const externalId = resolveExternalId(item)
    if (!externalId) return false

    const startIso = toStartTimeIso(item)
    if (requireToday && !isMatchForToday(item, startIso)) return false

    const { home, away } = parseHomeAway(item)

    await upsertFixture({
      sport_id: cricketSportId,
      external_id: externalId,
      home_team: home,
      away_team: away,
      start_time: startIso,
      status: normalizeStatus(item.status),
    })
    return true
  }

  let upserted = 0
  for (const item of list) {
    try {
      if (await tryUpsert(item, true)) upserted += 1
    } catch (e) {
      console.error('CricketData upsert failed for item', resolveExternalId(item), e)
    }
  }

  if (upserted === 0 && list.length > 0) {
    console.warn(
      'CricketData: no rows matched local today; ingesting all returned matches (API may already scope to current).'
    )
    for (const item of list) {
      try {
        if (await tryUpsert(item, false)) upserted += 1
      } catch (e) {
        console.error('CricketData upsert failed for item', resolveExternalId(item), e)
      }
    }
  }
}
