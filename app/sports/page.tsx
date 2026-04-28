import Link from "next/link";
import { SportsDisclaimer } from "@/components/sports/SportsDisclaimer";

export default function SportsPage() {
  const sports = [
    {
      slug: "football",
      name: "Football",
      icon: "⚽",
      blurb: "Today's fixtures and model outputs.",
    },
    {
      slug: "cricket",
      name: "Cricket",
      icon: "🏏",
      blurb: "Upcoming fixtures (about two weeks) and model outputs.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">Sports Analytics</h1>
        <p className="mb-8 text-muted-foreground">
          Explore fixtures and model-derived estimates for entertainment analytics.
        </p>
        <div className="mb-8">
          <SportsDisclaimer />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {sports.map((sport) => (
            <Link
              key={sport.slug}
              href={`/sports/${sport.slug}`}
              className="block rounded-xl border border-border bg-surface p-5 transition hover:border-primary/40 hover:bg-surface-hover"
            >
              <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-lg">
                  {sport.icon}
                </span>
                <span>{sport.name}</span>
              </h2>
              <p className="text-sm text-muted-foreground">{sport.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
