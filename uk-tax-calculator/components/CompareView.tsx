"use client";

import type { CalculatorResult } from "@payframe/lib/tax-engine";
import { formatGbp, formatPct } from "@payframe/lib/format";
import type { DisplayPeriod } from "./ResultsPanel";

type Props = {
  a: CalculatorResult;
  b: CalculatorResult;
  displayPeriod: DisplayPeriod;
};

function scale(annual: number, period: DisplayPeriod): number {
  if (period === "monthly") return annual / 12;
  if (period === "weekly") return annual / 52;
  return annual;
}

export function CompareView({ a, b, displayPeriod }: Props) {
  const digits = displayPeriod === "annual" ? 0 : 2;
  const netA = scale(a.netTakeHome.annual, displayPeriod);
  const netB = scale(b.netTakeHome.annual, displayPeriod);
  const delta = netB - netA;

  const rows: { label: string; a: number; b: number; money?: boolean }[] = [
    { label: "Gross", a: scale(a.gross.annual, displayPeriod), b: scale(b.gross.annual, displayPeriod), money: true },
    { label: "Take-home", a: netA, b: netB, money: true },
    { label: "Income tax", a: scale(a.incomeTax, displayPeriod), b: scale(b.incomeTax, displayPeriod), money: true },
    { label: "National Insurance", a: scale(a.nationalInsurance, displayPeriod), b: scale(b.nationalInsurance, displayPeriod), money: true },
    { label: "Pension", a: scale(a.pensionContribution, displayPeriod), b: scale(b.pensionContribution, displayPeriod), money: true },
    { label: "Student loan", a: scale(a.studentLoan + a.postgraduateLoan, displayPeriod), b: scale(b.studentLoan + b.postgraduateLoan, displayPeriod), money: true },
    { label: "Effective rate", a: a.effectiveTaxRate, b: b.effectiveTaxRate },
    { label: "Marginal rate", a: a.marginalTaxRate, b: b.marginalTaxRate },
  ];

  return (
    <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel-elevated)] p-5 sm:p-6">
      <h2
        className="mb-2 text-xl text-[var(--ink)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Side-by-side
      </h2>
      <p className="mb-5 text-sm text-[var(--muted)]">
        Scenario B take-home is{" "}
        <span className="font-medium text-[var(--text)]">
          {delta >= 0 ? "+" : ""}
          {formatGbp(delta, digits)}
        </span>{" "}
        versus Scenario A.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-[var(--muted)]">
              <th className="py-2 pr-3 font-medium">Figure</th>
              <th className="py-2 pr-3 font-medium">A</th>
              <th className="py-2 font-medium">B</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-[var(--line)]/70">
                <td className="py-2.5 pr-3 text-[var(--muted)]">{row.label}</td>
                <td className="py-2.5 pr-3 tabular-nums">
                  {row.money
                    ? formatGbp(row.a, digits)
                    : formatPct(row.a)}
                </td>
                <td className="py-2.5 tabular-nums">
                  {row.money
                    ? formatGbp(row.b, digits)
                    : formatPct(row.b)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
