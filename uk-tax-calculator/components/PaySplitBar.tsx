"use client";

import type { CalculatorResult } from "@payframe/lib/tax-engine";

type Props = {
  result: CalculatorResult;
};

export function PaySplitBar({ result }: Props) {
  const gross = Math.max(result.gross.annual, 0.01);
  const segments = [
    {
      key: "takeHome",
      label: "Take-home",
      value: Math.max(result.netTakeHome.annual, 0),
      color: "var(--take-home)",
    },
    {
      key: "tax",
      label: "Tax",
      value: result.incomeTax,
      color: "var(--tax)",
    },
    {
      key: "ni",
      label: "NI",
      value: result.nationalInsurance,
      color: "var(--ni)",
    },
    {
      key: "pension",
      label: "Pension",
      value: result.pensionContribution,
      color: "var(--pension)",
    },
    {
      key: "loan",
      label: "Loan",
      value: result.studentLoan + result.postgraduateLoan,
      color: "var(--loan)",
    },
  ].filter((s) => s.value > 0);

  return (
    <div>
      <div
        className="flex h-3 overflow-hidden rounded-full bg-white/10"
        role="img"
        aria-label="Gross pay split"
      >
        {segments.map((s) => (
          <div
            key={s.key}
            title={`${s.label}`}
            style={{
              width: `${(s.value / gross) * 100}%`,
              background: s.color,
            }}
            className="transition-[width] duration-500 ease-out"
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/65">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: s.color }}
            />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
