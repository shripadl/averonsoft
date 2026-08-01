"use client";

import type { CalculatorResult } from "@payframe/lib/tax-engine";
import { formatGbp, formatPct } from "@payframe/lib/format";
import { PaySplitBar } from "./PaySplitBar";

export type DisplayPeriod = "annual" | "monthly" | "weekly";

type Props = {
  result: CalculatorResult;
  displayPeriod: DisplayPeriod;
  onDisplayPeriodChange: (p: DisplayPeriod) => void;
};

function pick(result: CalculatorResult, period: DisplayPeriod, key: "gross" | "netTakeHome") {
  return result[key][period];
}

function scale(annual: number, period: DisplayPeriod): number {
  if (period === "monthly") return annual / 12;
  if (period === "weekly") return annual / 52;
  return annual;
}

export function ResultsPanel({
  result,
  displayPeriod,
  onDisplayPeriodChange,
}: Props) {
  const net = pick(result, displayPeriod, "netTakeHome");
  const gross = pick(result, displayPeriod, "gross");

  const rows = [
    { label: "Income tax", value: scale(result.incomeTax, displayPeriod), color: "var(--tax)" },
    {
      label: "National Insurance",
      value: scale(result.nationalInsurance, displayPeriod),
      color: "var(--ni)",
    },
    {
      label: "Pension",
      value: scale(result.pensionContribution, displayPeriod),
      color: "var(--pension)",
    },
    {
      label: "Student loan",
      value: scale(result.studentLoan + result.postgraduateLoan, displayPeriod),
      color: "var(--loan)",
    },
  ].filter((r) => r.value > 0);

  return (
    <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink)] p-5 text-white shadow-[0_18px_50px_-28px_rgba(15,28,26,0.7)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2
          className="text-xl text-[#e8f4f0]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Take-home
        </h2>
        <div className="inline-flex rounded-full bg-white/10 p-1 text-xs">
          {(["annual", "monthly", "weekly"] as DisplayPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onDisplayPeriodChange(p)}
              className={`rounded-full px-3 py-1.5 capitalize transition ${
                displayPeriod === p
                  ? "bg-[var(--teal)] text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {p === "annual" ? "Year" : p === "monthly" ? "Month" : "Week"}
            </button>
          ))}
        </div>
      </div>

      <p
        className="text-4xl tracking-tight text-white sm:text-5xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {formatGbp(net, displayPeriod === "annual" ? 0 : 2)}
      </p>
      <p className="mt-2 text-sm text-white/65">
        from {formatGbp(gross, displayPeriod === "annual" ? 0 : 2)} gross
      </p>

      <div className="mt-6">
        <PaySplitBar result={result} />
      </div>

      <dl className="mt-6 space-y-3 border-t border-white/10 pt-5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <dt className="flex items-center gap-2 text-white/75">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ background: row.color }}
              />
              {row.label}
            </dt>
            <dd className="font-medium tabular-nums">
              {formatGbp(row.value, displayPeriod === "annual" ? 0 : 2)}
            </dd>
          </div>
        ))}
      </dl>

      {result.incomeTaxBands.length > 0 ? (
        <div className="mt-6 border-t border-white/10 pt-5">
          <h3 className="mb-3 text-sm font-medium text-white/80">
            Income tax by band
          </h3>
          <ul className="space-y-2 text-sm">
            {result.incomeTaxBands
              .filter((b) => b.amountInBand > 0)
              .map((b) => (
                <li
                  key={b.name}
                  className="flex justify-between gap-3 text-white/70"
                >
                  <span>
                    {b.name} ({formatPct(b.rate)})
                  </span>
                  <span className="tabular-nums text-white">
                    {formatGbp(scale(b.tax, displayPeriod), 2)}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
        <Stat label="Effective rate" value={formatPct(result.effectiveTaxRate)} />
        <Stat label="Marginal rate" value={formatPct(result.marginalTaxRate)} />
        <Stat
          label="Personal allowance"
          value={formatGbp(result.personalAllowance)}
        />
        <Stat
          label="Taxable income"
          value={formatGbp(result.taxableIncome)}
        />
      </div>

      {result.employerNi > 0 ? (
        <div className="mt-5 rounded-[10px] bg-white/8 px-4 py-3 text-sm text-white/80">
          Employer NI {formatGbp(result.employerNi)} · True cost{" "}
          {formatGbp(result.trueCostToEmployer)}
        </div>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-white/6 px-3 py-3">
      <p className="text-xs text-white/55">{label}</p>
      <p className="mt-1 text-base font-medium tabular-nums">{value}</p>
    </div>
  );
}
