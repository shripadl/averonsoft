import { SportsNav } from '@/components/sports/SportsNav'
import { SportsDisclaimer } from '@/components/sports/SportsDisclaimer'
import type { ReactNode } from 'react'

export function SportsShell({
  title,
  subtitle,
  icon,
  children,
  showDisclaimer = true,
  disclaimerCompact = false,
}: {
  title: string
  subtitle?: string
  icon?: ReactNode
  children: React.ReactNode
  showDisclaimer?: boolean
  disclaimerCompact?: boolean
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                AveronSoft Analytics
              </p>
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {icon ? (
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl shadow-inner">
                    {icon}
                  </span>
                ) : null}
                <span>{title}</span>
              </h1>
              {subtitle ? (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <SportsNav />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {showDisclaimer ? (
          <div className="mb-6">
            <SportsDisclaimer compact={disclaimerCompact} />
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
}
