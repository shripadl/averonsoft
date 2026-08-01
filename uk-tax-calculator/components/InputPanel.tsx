"use client";

import type { ReactNode } from "react";
import type { CalculatorInput, PayPeriod } from "@payframe/lib/tax-engine";
import { ALL_TAX_YEARS } from "@payframe/lib/tax-engine";

type Props = {
  value: CalculatorInput;
  onChange: (next: CalculatorInput) => void;
  title?: string;
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[var(--text)]">{label}</span>
      {children}
      {hint ? (
        <span className="text-xs leading-snug text-[var(--muted)]">{hint}</span>
      ) : null}
    </label>
  );
}

const controlClass =
  "w-full rounded-[10px] border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal-soft)]";

export function InputPanel({ value, onChange, title = "Your pay" }: Props) {
  const set = <K extends keyof CalculatorInput>(
    key: K,
    next: CalculatorInput[K],
  ) => onChange({ ...value, [key]: next });

  const showHours = value.period === "hourly";
  const showDays = value.period === "daily" || value.period === "hourly";

  return (
    <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel-elevated)] p-5 shadow-[0_10px_40px_-28px_rgba(15,28,26,0.45)] sm:p-6">
      <h2
        className="mb-5 text-xl text-[var(--ink)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Gross pay">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              £
            </span>
            <input
              className={`${controlClass} pl-7`}
              type="number"
              min={0}
              step="any"
              value={value.amount || ""}
              onChange={(e) => set("amount", Number(e.target.value) || 0)}
            />
          </div>
        </Field>

        <Field label="Paid">
          <select
            className={controlClass}
            value={value.period}
            onChange={(e) => set("period", e.target.value as PayPeriod)}
          >
            <option value="annual">Yearly</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
            <option value="hourly">Hourly</option>
          </select>
        </Field>

        {showHours ? (
          <Field label="Hours each week" hint="Used to annualise hourly pay.">
            <input
              className={controlClass}
              type="number"
              min={0}
              step={0.5}
              value={value.hoursPerWeek}
              onChange={(e) => set("hoursPerWeek", Number(e.target.value) || 0)}
            />
          </Field>
        ) : null}

        {showDays ? (
          <Field label="Days each week" hint="Used for daily and hourly conversion.">
            <input
              className={controlClass}
              type="number"
              min={1}
              max={7}
              step={1}
              value={value.daysPerWeek}
              onChange={(e) => set("daysPerWeek", Number(e.target.value) || 5)}
            />
          </Field>
        ) : null}

        <Field label="Tax year">
          <select
            className={controlClass}
            value={value.taxYear}
            onChange={(e) =>
              set("taxYear", e.target.value as CalculatorInput["taxYear"])
            }
          >
            {ALL_TAX_YEARS.map((y) => (
              <option key={y.id} value={y.id}>
                {y.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Where you live"
          hint="Scotland has its own income-tax bands."
        >
          <select
            className={controlClass}
            value={value.region}
            onChange={(e) =>
              set("region", e.target.value as CalculatorInput["region"])
            }
          >
            <option value="england_wales_ni">England, Wales or NI</option>
            <option value="scotland">Scotland</option>
          </select>
        </Field>

        <Field
          label="Tax code"
          hint="Common codes: 1257L, BR, D0, D1, NT, 0T."
        >
          <input
            className={controlClass}
            type="text"
            value={value.taxCode}
            onChange={(e) => set("taxCode", e.target.value)}
          />
        </Field>

        <Field label="Age band" hint="Kept for future NI letter rules.">
          <select
            className={controlClass}
            value={value.ageBand}
            onChange={(e) =>
              set("ageBand", e.target.value as CalculatorInput["ageBand"])
            }
          >
            <option value="under_state_pension">Under State Pension age</option>
            <option value="state_pension_age">State Pension age or over</option>
          </select>
        </Field>

        <Field label="NI category letter">
          <select
            className={controlClass}
            value={value.niCategory}
            onChange={(e) =>
              set("niCategory", e.target.value as CalculatorInput["niCategory"])
            }
          >
            <option value="A">A — standard</option>
            <option value="B">B — married women reduced</option>
            <option value="C">C — over State Pension age</option>
            <option value="H">H — apprentice under 25</option>
            <option value="M">M — under 21</option>
            <option value="J">J — deferment</option>
            <option value="Z">Z — under 21 deferment</option>
            <option value="V">V — veteran</option>
          </select>
        </Field>

        <Field label="Student loan">
          <select
            className={controlClass}
            value={value.studentLoan}
            onChange={(e) =>
              set(
                "studentLoan",
                e.target.value as CalculatorInput["studentLoan"],
              )
            }
          >
            <option value="none">None</option>
            <option value="plan1">Plan 1</option>
            <option value="plan2">Plan 2</option>
            <option value="plan4">Plan 4</option>
            <option value="plan5">Plan 5</option>
          </select>
        </Field>
      </div>

      <div className="mt-5 grid gap-4 border-t border-[var(--line)] pt-5 sm:grid-cols-2">
        <Field label="Pension contribution">
          <div className="flex gap-2">
            <select
              className={`${controlClass} w-28 shrink-0`}
              value={value.pensionMode}
              onChange={(e) =>
                set(
                  "pensionMode",
                  e.target.value as CalculatorInput["pensionMode"],
                )
              }
            >
              <option value="percent">%</option>
              <option value="fixed">£</option>
            </select>
            <input
              className={controlClass}
              type="number"
              min={0}
              step="any"
              value={value.pensionValue || ""}
              onChange={(e) =>
                set("pensionValue", Number(e.target.value) || 0)
              }
            />
          </div>
        </Field>

        <Field
          label="Pension method"
          hint="Sacrifice and net-pay change taxable pay differently from relief at source."
        >
          <select
            className={controlClass}
            value={value.pensionMethod}
            onChange={(e) =>
              set(
                "pensionMethod",
                e.target.value as CalculatorInput["pensionMethod"],
              )
            }
          >
            <option value="salary_sacrifice">Salary sacrifice</option>
            <option value="relief_at_source">Relief at source</option>
            <option value="net_pay">Net pay arrangement</option>
          </select>
        </Field>

        <Field
          label="Other income (yearly)"
          hint="Rent or side income — taxed, but not for National Insurance."
        >
          <input
            className={controlClass}
            type="number"
            min={0}
            step="any"
            value={value.otherIncome || ""}
            onChange={(e) => set("otherIncome", Number(e.target.value) || 0)}
          />
        </Field>

        <Field
          label="Other pre-tax sacrifice (yearly)"
          hint="Cycle-to-work, childcare vouchers, and similar."
        >
          <input
            className={controlClass}
            type="number"
            min={0}
            step="any"
            value={value.otherSalarySacrifice || ""}
            onChange={(e) =>
              set("otherSalarySacrifice", Number(e.target.value) || 0)
            }
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-[var(--line)] pt-5">
        <Toggle
          checked={value.postgraduateLoan}
          onChange={(v) => set("postgraduateLoan", v)}
          label="Postgraduate loan as well"
        />
        <Toggle
          checked={value.blindPersonsAllowance}
          onChange={(v) => set("blindPersonsAllowance", v)}
          label="Blind Person’s Allowance"
        />
        <Toggle
          checked={value.marriageAllowance}
          onChange={(v) => set("marriageAllowance", v)}
          label="Receiving Marriage Allowance"
        />
        <Toggle
          checked={value.includeEmployerNi}
          onChange={(v) => set("includeEmployerNi", v)}
          label="Show employer National Insurance cost"
        />
      </div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-[var(--text)]">
      <input
        type="checkbox"
        className="size-4 rounded border-[var(--line)] accent-[var(--teal)]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
