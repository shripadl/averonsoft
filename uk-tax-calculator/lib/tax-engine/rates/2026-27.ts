import type { TaxYearRates } from "../types";

/**
 * UK tax rates for 2026–27 (6 Apr 2026 – 5 Apr 2027).
 *
 * Sources:
 * - https://www.gov.uk/income-tax-rates
 * - https://www.gov.uk/scottish-income-tax
 * - https://www.gov.uk/government/publications/budget-2025-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances
 * - https://www.gov.uk/repaying-your-student-loan/what-you-pay
 * - https://commonslibrary.parliament.uk/research-briefings/cbp-10618/
 *
 * Personal Allowance, basic-rate limit and NI primary/upper thresholds remain
 * frozen vs 2025–26. Scottish starter/basic band limits widened for 2026–27.
 * Plan 5 student loan repayments apply from April 2026.
 *
 * TODO: verify against HMRC "Rates and thresholds for employers 2026 to 2027"
 * page once published in the same tabular form as prior years (figures below
 * are from the Budget 2025 Annex A / gov.uk rate pages).
 */
export const rates2026_27: TaxYearRates = {
  id: "2026-27",
  label: "2026/27",
  sourceUrl: "https://www.gov.uk/income-tax-rates",
  personalAllowance: 12_570,
  paTaperThreshold: 100_000,
  paTaperEnd: 125_140,
  blindPersonsAllowance: 3_250,
  marriageAllowanceTransfer: 1_260,
  marriageAllowanceTaxReduction: 252,
  englandWalesNiBands: [
    { name: "Basic rate", limit: 37_700, rate: 0.2 },
    { name: "Higher rate", limit: 125_140, rate: 0.4 },
    { name: "Additional rate", limit: null, rate: 0.45 },
  ],
  scotlandBands: [
    // Absolute income bands from gov.uk Scottish Income Tax page, converted
    // to taxable-income limits (absolute − PA of £12,570).
    { name: "Starter rate", limit: 3_967, rate: 0.19 }, // to £16,537
    { name: "Basic rate", limit: 16_956, rate: 0.2 }, // to £29,526
    { name: "Intermediate rate", limit: 31_092, rate: 0.21 }, // to £43,662
    { name: "Higher rate", limit: 62_430, rate: 0.42 }, // to £75,000
    { name: "Advanced rate", limit: 125_140, rate: 0.45 }, // to £125,140
    { name: "Top rate", limit: null, rate: 0.48 },
  ],
  ni: {
    lowerEarningsLimit: 6_708, // £129/week × 52 — Annex A 2026–27
    primaryThreshold: 12_570,
    secondaryThreshold: 5_000,
    upperEarningsLimit: 50_270,
    employeeByCategory: {
      A: { main: 0.08, aboveUel: 0.02 },
      B: { main: 0.0185, aboveUel: 0.02 },
      C: { main: 0, aboveUel: 0 },
      H: { main: 0.08, aboveUel: 0.02 },
      J: { main: 0.02, aboveUel: 0.02 },
      M: { main: 0.08, aboveUel: 0.02 },
      Z: { main: 0.02, aboveUel: 0.02 },
      V: { main: 0.08, aboveUel: 0.02 },
    },
    employerRate: 0.15,
  },
  studentLoan: {
    plan1: 26_900,
    plan2: 29_385,
    plan4: 33_795,
    plan5: 25_000,
    postgraduate: 21_000,
    undergradRate: 0.09,
    postgraduateRate: 0.06,
  },
};
