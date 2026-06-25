import { TodayFixturesAutoRefresh } from '@/components/sports/TodayFixturesAutoRefresh'
import { SportsShell } from '@/components/sports/SportsShell'
import type { FixturePredictionEntry } from '@/components/sports/TodayFixturesList'
import { getServerFetchBaseUrl } from '@/lib/sports-engine/get-base-url'

type SportsDataMeta = {
  fixtures_count: number
  predicted_count: number
  generated_at: string
  stale: boolean
}

async function fetchTodayFootball() {
  const base = await getServerFetchBaseUrl()
  const res = await fetch(`${base}/api/sports/football/today`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to load football fixtures')
  return res.json() as Promise<{ entries: FixturePredictionEntry[]; meta: SportsDataMeta }>
}

export default async function FootballPage() {
  const { entries, meta } = await fetchTodayFootball()

  return (
    <SportsShell
      title="Football"
      subtitle="Today's fixtures with home-edge probability, model lean, confidence, and decision tiers."
      icon="⚽"
      disclaimerCompact
    >
      <TodayFixturesAutoRefresh
        apiPath="/api/sports/football/today"
        initialEntries={entries}
        initialMeta={meta}
        sportSlug="football"
      />
    </SportsShell>
  )
}
