import type { TaxYearRates } from "../types";

/**
 * UK tax rates for 2024–25 (6 Apr 2024 – 5 Apr 2025).
 *
 * Sources:
 * - https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2024-to-2025
 * - https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past
 * - https://www.gov.uk/income-tax-rates
 *
 * Employee NI main rate is 8% for the full 2024–25 year (reduced from 10% from 6 Apr 2024).
 * Employer NI rate is 13.8%; secondary threshold £9,100.
 */
export const rates2024_25: TaxYearRates = {
  id: "2024-25",
  label: "2024/25",
  sourceUrl:
    "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2024-to-2025",
  personalAllowance: 12_570,
  paTaperThreshold: 100_000,
  paTaperEnd: 125_140,
  blindPersonsAllowance: 3_070,
  marriageAllowanceTransfer: 1_260,
  marriageAllowanceTaxReduction: 252,
  englandWalesNiBands: [
    { name: "Basic rate", limit: 37_700, rate: 0.2 },
    { name: "Higher rate", limit: 125_140, rate: 0.4 },
    { name: "Additional rate", limit: null, rate: 0.45 },
  ],
  scotlandBands: [
    // Taxable income limits from HMRC employer rates table (above PA).
    { name: "Starter rate", limit: 2_306, rate: 0.19 },
    { name: "Basic rate", limit: 13_991, rate: 0.2 },
    { name: "Intermediate rate", limit: 31_092, rate: 0.21 },
    { name: "Higher rate", limit: 62_430, rate: 0.42 },
    { name: "Advanced rate", limit: 125_140, rate: 0.45 },
    { name: "Top rate", limit: null, rate: 0.48 },
  ],
  ni: {
    lowerEarningsLimit: 6_396,
    primaryThreshold: 12_570,
    secondaryThreshold: 9_100,
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
    employerRate: 0.138,
  },
  studentLoan: {
    plan1: 24_990,
    plan2: 27_295,
    plan4: 31_395,
    plan5: null, // repayments began April 2026
    postgraduate: 21_000,
    undergradRate: 0.09,
    postgraduateRate: 0.06,
  },
};
