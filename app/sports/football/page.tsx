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

async function fetchTodayFootball() {
  const base = await getServerFetchBaseUrl();
  const res = await fetch(`${base}/api/sports/football/today`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load football fixtures");
  return res.json() as Promise<{ entries: FixturePredictionEntry[]; meta: SportsDataMeta }>;
}

export default async function FootballPage() {
  const { entries, meta } = await fetchTodayFootball();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 flex items-center gap-3 text-3xl font-bold">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-2xl">
            ⚽
          </span>
          <span>Football - Today&apos;s Fixtures</span>
        </h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Home-edge probability and model lean are shown for each fixture, along with confidence and
          category tiers.
        </p>
        <div className="mb-4">
          <SportsDisclaimer compact />
        </div>
        <TodayFixturesAutoRefresh
          apiPath="/api/sports/football/today"
          initialEntries={entries}
          initialMeta={meta}
          sportSlug="football"
        />
      </div>
    </div>
  );
}
