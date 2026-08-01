import type { PayPeriod, PeriodAmounts } from "./types";

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

/** Convert a pay figure in any period to an annual amount. */
export function toAnnual(
  amount: number,
  period: PayPeriod,
  hoursPerWeek = 37.5,
  daysPerWeek = 5,
): number {
  if (!Number.isFinite(amount) || amount < 0) return 0;
  switch (period) {
    case "annual":
      return amount;
    case "monthly":
      return amount * MONTHS_PER_YEAR;
    case "weekly":
      return amount * WEEKS_PER_YEAR;
    case "daily":
      return amount * Math.max(daysPerWeek, 0) * WEEKS_PER_YEAR;
    case "hourly":
      return amount * Math.max(hoursPerWeek, 0) * WEEKS_PER_YEAR;
    default:
      return amount;
  }
}

/** Split an annual figure into common display periods. */
export function toPeriods(annual: number, daysPerWeek = 5): PeriodAmounts {
  const safe = Number.isFinite(annual) ? annual : 0;
  const days = Math.max(daysPerWeek, 1);
  return {
    annual: safe,
    monthly: safe / MONTHS_PER_YEAR,
    weekly: safe / WEEKS_PER_YEAR,
    daily: safe / (days * WEEKS_PER_YEAR),
  };
}

export function roundPence(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
