import { TodayFixturesAutoRefresh } from "@/components/sports/TodayFixturesAutoRefresh";
import { SportsDisclaimer } from "@/components/sports/SportsDisclaimer";
import type { FixturePredictionEntry } from "@/components/sports/TodayFixturesList";
import { getServerFetchBaseUrl } from "@/lib/sports-engine/get-base-url";

type SportsDataMeta = {
  fixtures_count: number;
  predicted_count: number;
  generated_at: string;
  stale: boolean;
};

async function fetchTodayCricket() {
  const base = await getServerFetchBaseUrl();
  const res = await fetch(`${base}/api/sports/cricket/today`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load cricket fixtures");
  return res.json() as Promise<{ entries: FixturePredictionEntry[]; meta: SportsDataMeta }>;
}

export default async function CricketPage() {
  const { entries, meta } = await fetchTodayCricket();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 flex items-center gap-3 text-3xl font-bold">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-2xl">
            🏏
          </span>
          <span>Cricket — upcoming fixtures</span>
        </h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Matches starting today through the next two weeks (CricAPI schedules rarely sit on a single
          calendar day). Home-edge probability, model lean, confidence, and category are shown as
          entertainment analytics.
        </p>
        <div className="mb-4">
          <SportsDisclaimer compact />
        </div>
        <TodayFixturesAutoRefresh
          apiPath="/api/sports/cricket/today"
          initialEntries={entries}
          initialMeta={meta}
          sportSlug="cricket"
          groupByDay
        />
      </div>
    </div>
  );
}
