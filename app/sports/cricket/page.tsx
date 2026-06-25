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

async function fetchTodayCricket() {
  const base = await getServerFetchBaseUrl()
  const res = await fetch(`${base}/api/sports/cricket/today`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to load cricket fixtures')
  return res.json() as Promise<{ entries: FixturePredictionEntry[]; meta: SportsDataMeta }>
}

export default async function CricketPage() {
  const { entries, meta } = await fetchTodayCricket()

  return (
    <SportsShell
      title="Cricket"
      subtitle="Upcoming fixtures (~2 weeks) with home-edge probability, model lean, confidence, and decision tiers."
      icon="🏏"
      disclaimerCompact
    >
      <TodayFixturesAutoRefresh
        apiPath="/api/sports/cricket/today"
        initialEntries={entries}
        initialMeta={meta}
        sportSlug="cricket"
        groupByDay
      />
    </SportsShell>
  )
}
