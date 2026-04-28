'use client'

import { useEffect, useMemo, useState } from 'react'
import { TodayFixturesList, type FixturePredictionEntry } from './TodayFixturesList'

type Props = {
  apiPath: string
  initialEntries: FixturePredictionEntry[]
  initialMeta?: SportsDataMeta | null
  sportSlug?: string
  groupByDay?: boolean
}

type SportsDataMeta = {
  fixtures_count: number
  predicted_count: number
  generated_at: string
  stale: boolean
}

const POLL_EVERY_MS = 20_000
const MAX_POLL_MS = 3 * 60_000

function isFullyPredicted(entries: FixturePredictionEntry[]): boolean {
  return entries.length > 0 && entries.every((e) => e.prediction != null)
}

export function TodayFixturesAutoRefresh({
  apiPath,
  initialEntries,
  initialMeta = null,
  sportSlug,
  groupByDay = false,
}: Props) {
  const [entries, setEntries] = useState<FixturePredictionEntry[]>(initialEntries)
  const [meta, setMeta] = useState<SportsDataMeta | null>(initialMeta)
  const [isPolling, setIsPolling] = useState<boolean>(() => !isFullyPredicted(initialEntries))
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  const shouldPoll = useMemo(() => !isFullyPredicted(entries), [entries])

  useEffect(() => {
    setMounted(true)
    if (initialEntries.length > 0) {
      setLastUpdatedAt(new Date())
    }
  }, [initialEntries.length])

  useEffect(() => {
    if (!shouldPoll) {
      setIsPolling(false)
      return
    }

    setIsPolling(true)
    const started = Date.now()

    const tick = async () => {
      try {
        const res = await fetch(apiPath, { cache: 'no-store' })
        if (!res.ok) return
        const json = (await res.json()) as {
          entries?: FixturePredictionEntry[]
          meta?: SportsDataMeta
        }
        if (Array.isArray(json.entries)) {
          setEntries(json.entries)
          setLastUpdatedAt(new Date())
        }
        if (json.meta) setMeta(json.meta)
      } catch {
        // Quiet retry; page still shows last known state.
      }
    }

    const interval = window.setInterval(() => {
      if (Date.now() - started >= MAX_POLL_MS) {
        window.clearInterval(interval)
        setIsPolling(false)
        return
      }
      void tick()
    }, POLL_EVERY_MS)

    void tick()

    return () => window.clearInterval(interval)
  }, [apiPath, shouldPoll])

  return (
    <div className="space-y-3">
      {isPolling ? (
        <div className="text-xs text-muted-foreground">
          Auto-refreshing every 20s while data is being generated...
        </div>
      ) : null}
      {mounted && lastUpdatedAt ? (
        <div className="text-xs text-muted-foreground">
          Last updated: {lastUpdatedAt.toLocaleTimeString()}
        </div>
      ) : null}
      {meta ? (
        <div
          className={`rounded-md border px-3 py-2 text-xs ${
            meta.stale
              ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100'
              : 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100'
          }`}
        >
          Data health: {meta.predicted_count}/{meta.fixtures_count} fixtures predicted • generated{' '}
          {new Date(meta.generated_at).toLocaleString()}
        </div>
      ) : null}
      <TodayFixturesList entries={entries} sportSlug={sportSlug} groupByDay={groupByDay} />
    </div>
  )
}
