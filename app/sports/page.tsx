import Link from 'next/link'
import { SportsShell } from '@/components/sports/SportsShell'

export default function SportsPage() {
  const sports = [
    {
      slug: 'football',
      name: 'Football',
      icon: '⚽',
      blurb: "Today's fixtures with home-edge probabilities, model lean, and confidence tiers.",
    },
    {
      slug: 'cricket',
      name: 'Cricket',
      icon: '🏏',
      blurb: 'Upcoming fixtures (~2 weeks) with the same analytics pipeline.',
    },
  ]

  return (
    <SportsShell
      title="Sports Analytics"
      subtitle="Explore fixtures and model-derived estimates for entertainment analytics. Not betting advice."
      showDisclaimer
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {sports.map((sport) => (
          <Link
            key={sport.slug}
            href={`/sports/${sport.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-surface to-surface/40 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/20" />
            <h2 className="mb-2 flex items-center gap-3 text-xl font-semibold">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-xl shadow-inner">
                {sport.icon}
              </span>
              <span>{sport.name}</span>
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{sport.blurb}</p>
          </Link>
        ))}
        <Link
          href="/sports/validator"
          className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg sm:col-span-2"
        >
          <h2 className="mb-2 text-xl font-semibold">Prediction Validator</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Daily accuracy reports vs prior-day predictions, 7/30-day views, and CSV export for
            longer history.
          </p>
        </Link>
      </div>
    </SportsShell>
  )
}
