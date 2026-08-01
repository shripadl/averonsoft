import type { TaxYearId, TaxYearRates } from "../types";
import { rates2024_25 } from "./2024-25";
import { rates2025_26 } from "./2025-26";
import { rates2026_27 } from "./2026-27";

export const ALL_TAX_YEARS: TaxYearRates[] = [
  rates2026_27,
  rates2025_26,
  rates2024_25,
];

const byId: Record<TaxYearId, TaxYearRates> = {
  "2024-25": rates2024_25,
  "2025-26": rates2025_26,
  "2026-27": rates2026_27,
};

export function getRates(taxYear: TaxYearId): TaxYearRates {
  const rates = byId[taxYear];
  if (!rates) {
    throw new Error(`Unsupported tax year: ${taxYear}`);
  }
  return rates;
}

/** Default to the current UK tax year based on today's date. */
export function getDefaultTaxYear(now = new Date()): TaxYearId {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();
  // Tax year starts 6 April
  const inNewTaxYear = month > 3 || (month === 3 && day >= 6);
  const startYear = inNewTaxYear ? year : year - 1;
  const id = `${startYear}-${String(startYear + 1).slice(2)}` as TaxYearId;
  if (id in byId) return id;
  return "2026-27";
}
