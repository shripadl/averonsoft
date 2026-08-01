/** Shared types for the UK tax calculation engine. Framework-agnostic. */

export type TaxYearId = "2024-25" | "2025-26" | "2026-27";

export type Region = "england_wales_ni" | "scotland";

export type PayPeriod = "annual" | "monthly" | "weekly" | "daily" | "hourly";

export type AgeBand = "under_state_pension" | "state_pension_age";

export type NiCategory =
  | "A"
  | "B"
  | "C"
  | "H"
  | "J"
  | "M"
  | "Z"
  | "V";

export type PensionMethod =
  | "salary_sacrifice"
  | "relief_at_source"
  | "net_pay";

export type PensionInputMode = "percent" | "fixed";

export type StudentLoanPlan = "none" | "plan1" | "plan2" | "plan4" | "plan5";

export interface TaxBand {
  name: string;
  /** Upper limit of taxable income in this band (null = no upper limit). */
  limit: number | null;
  rate: number;
}

export interface NiEmployeeRates {
  /** Rate between primary threshold and upper earnings limit. */
  main: number;
  /** Rate above upper earnings limit. */
  aboveUel: number;
}

export interface StudentLoanThresholds {
  plan1: number;
  plan2: number;
  plan4: number;
  /** Plan 5 repayments began April 2026; null means not applicable that year. */
  plan5: number | null;
  postgraduate: number;
  undergradRate: number;
  postgraduateRate: number;
}

export interface TaxYearRates {
  id: TaxYearId;
  label: string;
  /** Citation: HMRC / gov.uk source URL for these figures. */
  sourceUrl: string;
  personalAllowance: number;
  /** Income at which PA starts tapering (£1 per £2). */
  paTaperThreshold: number;
  /** Income at which PA is fully tapered away. */
  paTaperEnd: number;
  blindPersonsAllowance: number;
  /** 10% of PA transferable under Marriage Allowance. */
  marriageAllowanceTransfer: number;
  /** Basic-rate tax reduction from receiving Marriage Allowance. */
  marriageAllowanceTaxReduction: number;
  englandWalesNiBands: TaxBand[];
  scotlandBands: TaxBand[];
  ni: {
    lowerEarningsLimit: number;
    primaryThreshold: number;
    secondaryThreshold: number;
    upperEarningsLimit: number;
    employeeByCategory: Record<NiCategory, NiEmployeeRates>;
    employerRate: number;
  };
  studentLoan: StudentLoanThresholds;
}

export interface CalculatorInput {
  amount: number;
  period: PayPeriod;
  hoursPerWeek: number;
  daysPerWeek: number;
  taxYear: TaxYearId;
  region: Region;
  taxCode: string;
  ageBand: AgeBand;
  niCategory: NiCategory;
  pensionMode: PensionInputMode;
  pensionValue: number;
  pensionMethod: PensionMethod;
  studentLoan: StudentLoanPlan;
  postgraduateLoan: boolean;
  blindPersonsAllowance: boolean;
  marriageAllowance: boolean;
  otherIncome: number;
  otherSalarySacrifice: number;
  includeEmployerNi: boolean;
}

export interface BandBreakdownRow {
  name: string;
  rate: number;
  amountInBand: number;
  tax: number;
}

export interface PeriodAmounts {
  annual: number;
  monthly: number;
  weekly: number;
  daily: number;
}

export interface CalculatorResult {
  gross: PeriodAmounts;
  personalAllowance: number;
  taxableIncome: number;
  incomeTax: number;
  incomeTaxBands: BandBreakdownRow[];
  nationalInsurance: number;
  studentLoan: number;
  postgraduateLoan: number;
  pensionContribution: number;
  /** Amount deducted from take-home for relief-at-source (net of basic-rate relief). */
  pensionFromNetPay: number;
  otherSalarySacrifice: number;
  totalDeductions: number;
  netTakeHome: PeriodAmounts;
  employerNi: number;
  trueCostToEmployer: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  /** Gross used for tax after salary sacrifice (employment only). */
  employmentIncomeForTax: number;
  /** Earnings used for employee NI. */
  employmentIncomeForNi: number;
}
