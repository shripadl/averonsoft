"use client";

import { useEffect, useState, useTransition } from "react";
import {
  calculateTakeHome,
  defaultInput,
  getDefaultTaxYear,
  type CalculatorInput,
} from "@payframe/lib/tax-engine";
import { InputPanel } from "./InputPanel";
import { ResultsPanel, type DisplayPeriod } from "./ResultsPanel";
import { CompareView } from "./CompareView";
import { inputToSearchParams, searchParamsToInput } from "@payframe/lib/url-state";
import { trackEvent } from "@payframe/lib/analytics";
import { brand } from "@payframe/config/brand.config";

export function CalculatorApp() {
  const [input, setInput] = useState<CalculatorInput>(() =>
    defaultInput({ taxYear: getDefaultTaxYear() }),
  );
  const [compare, setCompare] = useState(false);
  const [inputB, setInputB] = useState<CalculatorInput>(() =>
    defaultInput({ taxYear: getDefaultTaxYear(), amount: 55_000 }),
  );
  const [displayPeriod, setDisplayPeriod] = useState<DisplayPeriod>("monthly");
  const [, startTransition] = useTransition();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = searchParamsToInput(params);
    setInput(fromUrl);
    if (params.get("compare") === "1") {
      setCompare(true);
      const bParams = new URLSearchParams();
      params.forEach((v, k) => {
        if (k.startsWith("b_")) bParams.set(k.slice(2), v);
      });
      if ([...bParams.keys()].length) {
        setInputB(searchParamsToInput(bParams));
      }
    }
    setHydrated(true);
    trackEvent("calculator_open");
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const params = inputToSearchParams(input);
    if (compare) {
      params.set("compare", "1");
      const b = inputToSearchParams(inputB);
      b.forEach((v, k) => params.set(`b_${k}`, v));
    }
    const qs = params.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [input, inputB, compare, hydrated]);

  const result = calculateTakeHome(input);
  const resultB = calculateTakeHome(inputB);

  const updateA = (next: CalculatorInput) => {
    startTransition(() => setInput(next));
  };
  const updateB = (next: CalculatorInput) => {
    startTransition(() => setInputB(next));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <header className="mb-10 max-w-2xl">
        <p
          className="text-3xl font-medium tracking-tight text-[var(--teal-deep)] sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {brand.logoText}
        </p>
        <h1 className="mt-3 text-lg text-[var(--text)] sm:text-xl">
          {brand.tagline}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          Type a salary and watch take-home, tax bands, National Insurance and
          loan repayments update live — based on HMRC rates for the tax year
          you pick.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setCompare((c) => !c);
            trackEvent("toggle_compare", { enabled: !compare });
          }}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            compare
              ? "border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal-deep)]"
              : "border-[var(--line)] bg-white text-[var(--text)] hover:border-[var(--teal)]"
          }`}
        >
          {compare ? "Hide comparison" : "Compare two scenarios"}
        </button>
        {compare ? (
          <button
            type="button"
            onClick={() => setInputB({ ...input })}
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            Copy A → B
          </button>
        ) : null}
      </div>

      {!compare ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <InputPanel value={input} onChange={updateA} />
          <div className="lg:sticky lg:top-6">
            <ResultsPanel
              result={result}
              displayPeriod={displayPeriod}
              onDisplayPeriodChange={setDisplayPeriod}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <InputPanel value={input} onChange={updateA} title="Scenario A" />
            <InputPanel value={inputB} onChange={updateB} title="Scenario B" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[var(--muted)]">Show figures by</span>
            {(["annual", "monthly", "weekly"] as DisplayPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDisplayPeriod(p)}
                className={`rounded-full px-3 py-1.5 text-xs capitalize ${
                  displayPeriod === p
                    ? "bg-[var(--teal)] text-white"
                    : "bg-white text-[var(--muted)] border border-[var(--line)]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <CompareView a={result} b={resultB} displayPeriod={displayPeriod} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ResultsPanel
              result={result}
              displayPeriod={displayPeriod}
              onDisplayPeriodChange={setDisplayPeriod}
            />
            <ResultsPanel
              result={resultB}
              displayPeriod={displayPeriod}
              onDisplayPeriodChange={setDisplayPeriod}
            />
          </div>
        </div>
      )}

      <footer className="mt-12 space-y-4 border-t border-[var(--line)] pt-8 text-sm text-[var(--muted)]">
        <p>
          Figures are estimates for guidance only — not tax or financial advice.
          They use published HMRC rates for the selected tax year. Confirm your
          position with HMRC or a qualified adviser before making decisions.
        </p>
        <p>
          Data sources:{" "}
          <a
            className="text-[var(--teal-deep)] underline-offset-2 hover:underline"
            href="https://www.gov.uk/income-tax-rates"
            target="_blank"
            rel="noreferrer"
          >
            Income Tax rates (GOV.UK)
          </a>
          ,{" "}
          <a
            className="text-[var(--teal-deep)] underline-offset-2 hover:underline"
            href="https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026"
            target="_blank"
            rel="noreferrer"
          >
            employer rates & thresholds
          </a>
          ,{" "}
          <a
            className="text-[var(--teal-deep)] underline-offset-2 hover:underline"
            href="https://www.gov.uk/repaying-your-student-loan/what-you-pay"
            target="_blank"
            rel="noreferrer"
          >
            student loan repayments
          </a>
          .
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          {brand.footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[var(--teal-deep)]"
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
          {brand.parentCredit ? (
            <a
              href={brand.parentUrl}
              className="hover:text-[var(--teal-deep)]"
              target="_blank"
              rel="noreferrer"
            >
              {brand.parentCredit}
            </a>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
