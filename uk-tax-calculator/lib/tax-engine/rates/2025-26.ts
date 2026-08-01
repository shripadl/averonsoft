import type { TaxYearRates } from "../types";

/**
 * UK tax rates for 2025–26 (6 Apr 2025 – 5 Apr 2026).
 *
 * Sources:
 * - https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026
 * - https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past
 * - https://www.gov.uk/income-tax-rates
 *
 * Employer NI rate is 15%; secondary threshold £5,000 from 6 Apr 2025.
 */
export const rates2025_26: TaxYearRates = {
  id: "2025-26",
  label: "2025/26",
  sourceUrl:
    "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026",
  personalAllowance: 12_570,
  paTaperThreshold: 100_000,
  paTaperEnd: 125_140,
  blindPersonsAllowance: 3_130,
  marriageAllowanceTransfer: 1_260,
  marriageAllowanceTaxReduction: 252,
  englandWalesNiBands: [
    { name: "Basic rate", limit: 37_700, rate: 0.2 },
    { name: "Higher rate", limit: 125_140, rate: 0.4 },
    { name: "Additional rate", limit: null, rate: 0.45 },
  ],
  scotlandBands: [
    { name: "Starter rate", limit: 2_827, rate: 0.19 },
    { name: "Basic rate", limit: 14_921, rate: 0.2 },
    { name: "Intermediate rate", limit: 31_092, rate: 0.21 },
    { name: "Higher rate", limit: 62_430, rate: 0.42 },
    { name: "Advanced rate", limit: 125_140, rate: 0.45 },
    { name: "Top rate", limit: null, rate: 0.48 },
  ],
  ni: {
    lowerEarningsLimit: 6_500,
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
    plan1: 26_065,
    plan2: 28_470,
    plan4: 32_745,
    plan5: null, // repayments began April 2026
    postgraduate: 21_000,
    undergradRate: 0.09,
    postgraduateRate: 0.06,
  },
};
