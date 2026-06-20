'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { runProjection } from '@/lib/sip-swp/calculator'
import { formatMoney } from '@/lib/sip-swp/format'
import {
  buildSipSwpPdf,
  loadPdfUnicodeFont,
} from '@/lib/sip-swp/pdf-export'
import {
  REGIONS,
  REGION_FLAGS,
  TAX_DB,
  type CalcMode,
  type RegionKey,
} from '@/lib/sip-swp/regions'
import { PortfolioChart } from './PortfolioChart'
import { IllustrationDisclaimer } from './IllustrationDisclaimer'
import { Button } from '@/components/ui/button'

type View = 'projector' | 'tax'

const DEFAULTS = {
  amountInvest: 2500,
  amountDraw: 3000,
  rate: 9.5,
  years: 15,
  stepup: 5,
  lumpsum: 500000,
}

function Toggle({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  sub: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
      <div>
        <div className="text-xs font-semibold text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground">{sub}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
          checked ? 'border-primary bg-primary' : 'border-border bg-muted'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          } mt-0.5`}
        />
      </button>
    </div>
  )
}

function NumberInput({
  id,
  label,
  prefix,
  value,
  onChange,
}: {
  id: string
  label: string
  prefix: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <div className="flex overflow-hidden rounded-lg border border-border bg-card">
        <span className="flex items-center border-r border-border bg-muted/50 px-2.5 font-mono text-sm font-bold text-primary">
          {prefix}
        </span>
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="h-9 flex-1 bg-transparent px-3 font-mono text-sm outline-none focus:bg-primary/5"
        />
      </div>
    </div>
  )
}

export function SipSwpClient() {
  const [view, setView] = useState<View>('projector')
  const [region, setRegion] = useState<RegionKey>('USA')
  const [mode, setMode] = useState<CalcMode>('INVEST')
  const [taxRegion, setTaxRegion] = useState<RegionKey>('USA')
  const [inflationOn, setInflationOn] = useState(false)
  const [taxOn, setTaxOn] = useState(false)
  const [amount, setAmount] = useState(DEFAULTS.amountInvest)
  const [rate, setRate] = useState(DEFAULTS.rate)
  const [years, setYears] = useState(DEFAULTS.years)
  const [stepup, setStepup] = useState(DEFAULTS.stepup)
  const [lumpsum, setLumpsum] = useState(DEFAULTS.lumpsum)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [pdfExporting, setPdfExporting] = useState(false)

  useEffect(() => {
    void loadPdfUnicodeFont()
  }, [])

  const cfg = REGIONS[region]
  const sym = cfg.symbol

  const { yearlyData, metricLabels } = useMemo(
    () =>
      runProjection({
        region,
        mode,
        amount,
        rate,
        years,
        stepup,
        lumpsum,
        inflationOn,
        taxOn,
      }),
    [region, mode, amount, rate, years, stepup, lumpsum, inflationOn, taxOn]
  )

  const last = yearlyData[yearlyData.length - 1]
  const summary = last
    ? {
        p1: formatMoney(sym, last.principal),
        p2: formatMoney(sym, last.growth),
        p3: formatMoney(sym, last.net),
        tax: formatMoney(sym, last.tax),
      }
    : { p1: '—', p2: '—', p3: '—', tax: '—' }

  const switchMode = (m: CalcMode) => {
    setMode(m)
    setAmount(m === 'INVEST' ? DEFAULTS.amountInvest : DEFAULTS.amountDraw)
  }

  const exportCsv = useCallback(() => {
    if (!last) return
    const modeLabel = mode === 'INVEST' ? 'Accumulation' : 'Drawdown'
    let csv = 'SIP/SWP Calculator - Portfolio Audit Ledger\n'
    csv += `Region,${region}\nMode,${modeLabel}\nInflation Adjusted,${inflationOn}\nTax Drag Applied,${taxOn}\n\n`
    csv += `Summary Metric,Value\nPrincipal / Asset Pool,${formatMoney(sym, last.principal)}\nGrowth / Withdrawals,${formatMoney(sym, last.growth)}\nEst. Tax Drag,${formatMoney(sym, last.tax)}\nNet Terminal Value,${formatMoney(sym, last.net)}\n\n`
    csv += 'Year,Principal,Growth,Tax Drag,Net Balance\n'
    yearlyData.forEach((d) => {
      csv += `Year ${d.year},${formatMoney(sym, d.principal)},${formatMoney(sym, d.growth)},${formatMoney(sym, d.tax)},${formatMoney(sym, d.net)}\n`
    })
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SIPSWP_${region}_${modeLabel}_Report.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [sym, region, mode, inflationOn, taxOn, last, yearlyData])

  const copySummary = useCallback(async () => {
    const modeLabel = mode === 'INVEST' ? 'Accumulation' : 'Drawdown'
    const text = `SIP/SWP Calculator — ${region} ${modeLabel} Summary\nPrincipal: ${summary.p1}\nGrowth / Returns: ${summary.p2}\nEst. Tax Drag: ${summary.tax}\nNet Terminal Value: ${summary.p3}`
    await navigator.clipboard.writeText(text)
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2000)
  }, [mode, region, summary])

  const exportPdf = useCallback(async () => {
    if (!last || pdfExporting) return
    setPdfExporting(true)
    try {
      await loadPdfUnicodeFont()
      const modeLabel = mode === 'INVEST' ? 'Accumulation' : 'Drawdown'
      const doc = buildSipSwpPdf({
        region,
        modeLabel,
        inflationOn,
        taxOn,
        yearlyData,
        last,
      })
      doc.save(`SIPSWP_${region}_${modeLabel}_Report.pdf`)
    } finally {
      setPdfExporting(false)
    }
  }, [region, mode, inflationOn, taxOn, last, yearlyData, pdfExporting])

  return (
    <div className="space-y-3">
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:min-h-[640px] lg:flex-row">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col gap-3 border-b border-border bg-muted/30 p-4 lg:w-72 lg:border-b-0 lg:border-r lg:overflow-y-auto">
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Region
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(REGIONS) as RegionKey[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={`rounded-lg border px-2 py-2 text-left text-xs font-semibold transition-colors ${
                  region === r
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                }`}
              >
                <span className="block text-base">{REGION_FLAGS[r]}</span>
                {r === 'IND' ? 'India' : r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Mode
          </div>
          <div className="flex rounded-lg bg-muted p-0.5">
            <button
              type="button"
              onClick={() => switchMode('INVEST')}
              className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold transition-colors ${
                mode === 'INVEST' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Accumulation
            </button>
            <button
              type="button"
              onClick={() => switchMode('DRAWDOWN')}
              className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold transition-colors ${
                mode === 'DRAWDOWN' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Drawdown
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Inputs
          </div>
          {mode === 'DRAWDOWN' && (
            <NumberInput
              id="lumpsum"
              label="Initial Asset Pool"
              prefix={sym}
              value={lumpsum}
              onChange={setLumpsum}
            />
          )}
          <NumberInput
            id="amount"
            label={mode === 'INVEST' ? cfg.termInv : cfg.termDraw}
            prefix={sym}
            value={amount}
            onChange={setAmount}
          />
          <NumberInput id="rate" label="Expected Yield (%)" prefix="%" value={rate} onChange={setRate} />
          <NumberInput id="years" label="Horizon (Years)" prefix="yr" value={years} onChange={setYears} />
          {mode === 'INVEST' && (
            <NumberInput
              id="stepup"
              label="Annual Step-Up (%)"
              prefix="%"
              value={stepup}
              onChange={setStepup}
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Adjustments
          </div>
          <Toggle
            checked={inflationOn}
            onChange={setInflationOn}
            label="Inflation Adjustment"
            sub={
              inflationOn
                ? 'On — Real (inflation-adjusted) values'
                : 'Off — Nominal values'
            }
          />
          <Toggle
            checked={taxOn}
            onChange={setTaxOn}
            label="Capital Gains Tax Drag"
            sub={
              taxOn
                ? 'On — Capital gains tax applied'
                : `Off — Pre-tax values (est. ${cfg.taxRate}% rate)`
            }
          />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/20 p-2">
          <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setView('projector')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'projector' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Projection
          </button>
          <button
            type="button"
            onClick={() => setView('tax')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'tax' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Tax & Compliance
          </button>
          </div>
          <span className="px-2 text-[11px] font-medium text-muted-foreground">averonsoft.com</span>
        </div>

        {view === 'projector' ? (
          <>
            <div className="border-b border-border bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{region}</span> — {cfg.desc}
            </div>

            <div className="grid grid-cols-2 gap-2 border-b border-border p-3 sm:grid-cols-4">
              {[
                { label: metricLabels[0], value: summary.p1, sub: 'Principal capital' },
                { label: metricLabels[1], value: summary.p2, sub: 'Compound growth yield' },
                { label: metricLabels[2], value: summary.tax, sub: 'Capital gains est.' },
              ].map((m) => (
                <div key={m.label} className="rounded-lg border border-border bg-card p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {m.label}
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold">{m.value}</div>
                  <div className="text-[10px] text-muted-foreground">{m.sub}</div>
                </div>
              ))}
              <div className="rounded-lg border border-primary bg-primary p-3 text-primary-foreground">
                <div className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                  Net Terminal Value
                </div>
                <div className="mt-1 font-mono text-lg font-bold">{summary.p3}</div>
                <div className="text-[10px] opacity-80">Final net balance</div>
              </div>
            </div>

            <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
              <div className="flex min-h-[280px] flex-1 flex-col p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Portfolio Growth
                </div>
                <PortfolioChart data={yearlyData} taxOn={taxOn} />
                <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />
                    Capital basis
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" />
                    Compound growth
                  </span>
                  {taxOn && (
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" />
                      Est. tax drag
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={exportCsv}>
                    Export CSV
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={exportPdf}
                    disabled={pdfExporting}
                  >
                    {pdfExporting ? 'Generating…' : 'Save PDF'}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={copySummary}>
                    {copyFeedback ? 'Copied!' : 'Copy summary'}
                  </Button>
                </div>
              </div>

              <div className="flex w-full flex-col border-t border-border lg:w-80 lg:border-l lg:border-t-0">
                <div className="border-b border-border px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Year-by-year ledger
                </div>
                <div className="max-h-80 overflow-auto lg:max-h-none lg:flex-1">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Year</th>
                        <th className="px-3 py-2 font-semibold">Principal</th>
                        <th className="px-3 py-2 font-semibold">Growth</th>
                        <th className="px-3 py-2 font-semibold">Tax</th>
                        <th className="px-3 py-2 font-semibold">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyData.map((d) => (
                        <tr key={d.year} className="border-t border-border/60">
                          <td className="px-3 py-1.5 font-mono">Y{d.year}</td>
                          <td className="px-3 py-1.5 font-mono">{formatMoney(sym, d.principal)}</td>
                          <td className="px-3 py-1.5 font-mono text-green-600 dark:text-green-400">
                            {formatMoney(sym, d.growth)}
                          </td>
                          <td
                            className={`px-3 py-1.5 font-mono ${taxOn && d.tax > 0 ? 'text-red-600 dark:text-red-400' : ''}`}
                          >
                            {formatMoney(sym, d.tax)}
                          </td>
                          <td className="px-3 py-1.5 font-mono font-semibold">
                            {formatMoney(sym, d.net)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <h2 className="text-lg font-bold">Tax & regulatory reference</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cross-border contribution ceilings, capital gains rules, and withdrawal limits.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(REGIONS) as RegionKey[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTaxRegion(r)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    taxRegion === r
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {REGION_FLAGS[r]} {r === 'IND' ? 'India' : r}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {TAX_DB[taxRegion].map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-primary">
                    {item.eyebrow}
                  </div>
                  <h3 className="mt-1 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    Official regulatory source →
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-300">
                Disclaimer
              </div>
              <p className="mt-2 text-sm italic leading-relaxed text-red-800/90 dark:text-red-200/90">
                This tool provides algorithmic projections for illustrative purposes only. It does
                not constitute legal, fiduciary, or certified tax advice. Regulatory rules change
                over time. Verify figures with licensed tax practitioners before making financial
                decisions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    <IllustrationDisclaimer />
    </div>
  )
}
