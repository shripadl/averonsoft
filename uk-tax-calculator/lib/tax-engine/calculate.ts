import type {
  BandBreakdownRow,
  CalculatorInput,
  CalculatorResult,
  NiCategory,
  Region,
  StudentLoanPlan,
  TaxBand,
  TaxYearRates,
} from "./types";
import { getRates } from "./rates";
import { parseTaxCode } from "./tax-code";
import { roundPence, toAnnual, toPeriods } from "./pay";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function pensionGrossAmount(
  employmentGross: number,
  input: CalculatorInput,
): number {
  if (input.pensionValue <= 0) return 0;
  if (input.pensionMode === "percent") {
    return employmentGross * (input.pensionValue / 100);
  }
  return Math.min(input.pensionValue, employmentGross);
}

/**
 * Adjusted net income for PA taper: employment after salary-sacrifice-style
 * deductions + other income. Net-pay pension also reduces ANI; RAS does not
 * reduce ANI for this simplified model (relief is claimed separately).
 */
function adjustedNetIncome(
  employmentGross: number,
  salarySacrificeTotal: number,
  netPayPension: number,
  otherIncome: number,
): number {
  return Math.max(
    0,
    employmentGross - salarySacrificeTotal - netPayPension + otherIncome,
  );
}

function taperedPersonalAllowance(
  baseAllowance: number,
  ani: number,
  rates: TaxYearRates,
): number {
  if (baseAllowance <= 0) return 0;
  if (ani <= rates.paTaperThreshold) return baseAllowance;
  const reduction = Math.floor((ani - rates.paTaperThreshold) / 2);
  return Math.max(0, baseAllowance - reduction);
}

function applyBands(
  taxableIncome: number,
  bands: TaxBand[],
): { total: number; breakdown: BandBreakdownRow[] } {
  const breakdown: BandBreakdownRow[] = [];
  let remaining = Math.max(0, taxableIncome);
  let lower = 0;
  let total = 0;

  for (const band of bands) {
    const upper = band.limit ?? Number.POSITIVE_INFINITY;
    const width = Math.max(0, upper - lower);
    const inBand = Math.min(remaining, width);
    const tax = inBand * band.rate;
    if (inBand > 0 || band.limit === null) {
      breakdown.push({
        name: band.name,
        rate: band.rate,
        amountInBand: roundPence(inBand),
        tax: roundPence(tax),
      });
    }
    total += tax;
    remaining -= inBand;
    lower = upper;
    if (remaining <= 0) break;
  }

  return { total: roundPence(total), breakdown };
}

function bandsForRegion(rates: TaxYearRates, region: Region): TaxBand[] {
  return region === "scotland"
    ? rates.scotlandBands
    : rates.englandWalesNiBands;
}

function computeIncomeTax(opts: {
  taxablePay: number;
  rates: TaxYearRates;
  region: Region;
  taxCode: string;
  blind: boolean;
  marriageAllowance: boolean;
  ani: number;
}): { tax: number; bands: BandBreakdownRow[]; personalAllowance: number } {
  const parsed = parseTaxCode(opts.taxCode, opts.rates.personalAllowance);

  if (parsed.mode === "no_tax") {
    return { tax: 0, bands: [], personalAllowance: 0 };
  }

  if (parsed.mode === "basic_rate_only") {
    const tax = roundPence(opts.taxablePay * 0.2);
    return {
      tax,
      bands: [
        {
          name: "Basic rate (BR)",
          rate: 0.2,
          amountInBand: roundPence(opts.taxablePay),
          tax,
        },
      ],
      personalAllowance: 0,
    };
  }

  if (parsed.mode === "higher_rate_only") {
    const tax = roundPence(opts.taxablePay * 0.4);
    return {
      tax,
      bands: [
        {
          name: "Higher rate (D0)",
          rate: 0.4,
          amountInBand: roundPence(opts.taxablePay),
          tax,
        },
      ],
      personalAllowance: 0,
    };
  }

  if (parsed.mode === "additional_rate_only") {
    const tax = roundPence(opts.taxablePay * 0.45);
    return {
      tax,
      bands: [
        {
          name: "Additional rate (D1)",
          rate: 0.45,
          amountInBand: roundPence(opts.taxablePay),
          tax,
        },
      ],
      personalAllowance: 0,
    };
  }

  let allowance =
    parsed.mode === "no_allowance"
      ? 0
      : (parsed.allowance ?? opts.rates.personalAllowance);

  if (opts.blind) {
    allowance += opts.rates.blindPersonsAllowance;
  }

  // K-code negative allowance: add to taxable income rather than subtract.
  let taxableIncome: number;
  let personalAllowance: number;

  if (allowance < 0) {
    personalAllowance = 0;
    taxableIncome = opts.taxablePay - allowance; // allowance is negative
  } else {
    personalAllowance = taperedPersonalAllowance(allowance, opts.ani, opts.rates);
    taxableIncome = Math.max(0, opts.taxablePay - personalAllowance);
  }

  const { total, breakdown } = applyBands(
    taxableIncome,
    bandsForRegion(opts.rates, opts.region),
  );

  let tax = total;

  // Marriage Allowance: fixed basic-rate tax reduction for the recipient.
  if (opts.marriageAllowance && tax > 0) {
    // Only meaningful for basic-rate taxpayers; cap at tax due.
    const reduction = Math.min(opts.rates.marriageAllowanceTaxReduction, tax);
    // Heuristic: if any higher/additional/scottish-higher+ tax is due, skip.
    const higherTax = breakdown
      .filter((b) => b.rate > 0.21)
      .reduce((s, b) => s + b.tax, 0);
    if (higherTax === 0) {
      tax = roundPence(tax - reduction);
    }
  }

  return { tax, bands: breakdown, personalAllowance };
}

function computeEmployeeNi(
  earnings: number,
  category: NiCategory,
  rates: TaxYearRates,
): number {
  const cat = rates.ni.employeeByCategory[category];
  if (!cat || (cat.main === 0 && cat.aboveUel === 0)) return 0;

  const pt = rates.ni.primaryThreshold;
  const uel = rates.ni.upperEarningsLimit;
  if (earnings <= pt) return 0;

  const mainBand = Math.min(earnings, uel) - pt;
  const above = Math.max(0, earnings - uel);
  return roundPence(mainBand * cat.main + above * cat.aboveUel);
}

function computeEmployerNi(earnings: number, rates: TaxYearRates): number {
  const st = rates.ni.secondaryThreshold;
  if (earnings <= st) return 0;
  return roundPence((earnings - st) * rates.ni.employerRate);
}

function studentLoanThreshold(
  plan: StudentLoanPlan,
  rates: TaxYearRates,
): number | null {
  switch (plan) {
    case "plan1":
      return rates.studentLoan.plan1;
    case "plan2":
      return rates.studentLoan.plan2;
    case "plan4":
      return rates.studentLoan.plan4;
    case "plan5":
      return rates.studentLoan.plan5;
    default:
      return null;
  }
}

function computeStudentLoan(
  income: number,
  plan: StudentLoanPlan,
  rates: TaxYearRates,
): number {
  const threshold = studentLoanThreshold(plan, rates);
  if (threshold == null || income <= threshold) return 0;
  return roundPence((income - threshold) * rates.studentLoan.undergradRate);
}

function computePostgraduateLoan(income: number, rates: TaxYearRates): number {
  const threshold = rates.studentLoan.postgraduate;
  if (income <= threshold) return 0;
  return roundPence(
    (income - threshold) * rates.studentLoan.postgraduateRate,
  );
}

interface CoreBreakdown {
  grossAnnual: number;
  pensionContribution: number;
  pensionFromNetPay: number;
  otherSalarySacrifice: number;
  employmentIncomeForTax: number;
  employmentIncomeForNi: number;
  personalAllowance: number;
  taxableIncome: number;
  incomeTax: number;
  incomeTaxBands: BandBreakdownRow[];
  nationalInsurance: number;
  studentLoan: number;
  postgraduateLoan: number;
  employerNi: number;
  netAnnual: number;
  totalDeductions: number;
}

function computeCore(input: CalculatorInput): CoreBreakdown {
  const rates = getRates(input.taxYear);
  const grossAnnual = toAnnual(
    input.amount,
    input.period,
    input.hoursPerWeek,
    input.daysPerWeek,
  );

  const pensionContribution = pensionGrossAmount(grossAnnual, input);
  const otherSacrifice = Math.max(0, input.otherSalarySacrifice);

  let salarySacrificePension = 0;
  let netPayPension = 0;
  let pensionFromNetPay = 0;

  if (input.pensionMethod === "salary_sacrifice") {
    salarySacrificePension = pensionContribution;
  } else if (input.pensionMethod === "net_pay") {
    netPayPension = pensionContribution;
  } else {
    // Relief at source: employee pays ~80% from net; scheme claims 20%.
    pensionFromNetPay = roundPence(pensionContribution * 0.8);
  }

  const totalSalarySacrifice = salarySacrificePension + otherSacrifice;

  // Taxable employment pay: reduced by salary sacrifice and net-pay pension.
  const employmentIncomeForTax = Math.max(
    0,
    grossAnnual - totalSalarySacrifice - netPayPension,
  );

  // NI earnings: reduced by salary sacrifice only (not net-pay or RAS).
  const employmentIncomeForNi = Math.max(0, grossAnnual - totalSalarySacrifice);

  const otherIncome = Math.max(0, input.otherIncome);
  const taxablePay = employmentIncomeForTax + otherIncome;

  const ani = adjustedNetIncome(
    grossAnnual,
    totalSalarySacrifice,
    netPayPension,
    otherIncome,
  );

  const { tax, bands, personalAllowance } = computeIncomeTax({
    taxablePay,
    rates,
    region: input.region,
    taxCode: input.taxCode,
    blind: input.blindPersonsAllowance,
    marriageAllowance: input.marriageAllowance,
    ani,
  });

  const nationalInsurance = computeEmployeeNi(
    employmentIncomeForNi,
    input.niCategory,
    rates,
  );

  // Student loan: typically assessed on PAYE earnings after salary sacrifice.
  // Other (non-employment) income is included for a more complete estimate.
  const loanIncome = employmentIncomeForNi + otherIncome;
  const studentLoan = computeStudentLoan(loanIncome, input.studentLoan, rates);
  const postgraduateLoan = input.postgraduateLoan
    ? computePostgraduateLoan(loanIncome, rates)
    : 0;

  const employerNi = input.includeEmployerNi
    ? computeEmployerNi(employmentIncomeForNi, rates)
    : 0;

  const taxableIncome = Math.max(0, taxablePay - Math.max(0, personalAllowance));

  // Take-home: start from cash received after sacrifice, then deduct tax/NI/loans/RAS.
  const cashAfterSacrifice = Math.max(0, grossAnnual - totalSalarySacrifice);
  const totalDeductions = roundPence(
    tax +
      nationalInsurance +
      studentLoan +
      postgraduateLoan +
      netPayPension +
      pensionFromNetPay,
  );
  const netAnnual = roundPence(cashAfterSacrifice - totalDeductions);

  return {
    grossAnnual,
    pensionContribution: roundPence(pensionContribution),
    pensionFromNetPay,
    otherSalarySacrifice: roundPence(otherSacrifice),
    employmentIncomeForTax: roundPence(employmentIncomeForTax),
    employmentIncomeForNi: roundPence(employmentIncomeForNi),
    personalAllowance: roundPence(personalAllowance),
    taxableIncome: roundPence(taxableIncome),
    incomeTax: tax,
    incomeTaxBands: bands,
    nationalInsurance,
    studentLoan,
    postgraduateLoan,
    employerNi,
    netAnnual,
    totalDeductions: roundPence(
      tax +
        nationalInsurance +
        studentLoan +
        postgraduateLoan +
        pensionContribution +
        otherSacrifice,
    ),
  };
}

/** Estimate marginal combined rate by bumping gross employment income £100. */
function estimateMarginalRate(input: CalculatorInput): number {
  const base = computeCore(input);
  const bumped: CalculatorInput = {
    ...input,
    // Normalise to annual so the bump is clean.
    amount: base.grossAnnual + 100,
    period: "annual",
  };
  const next = computeCore(bumped);
  const extraDeducted = base.netAnnual + 100 - next.netAnnual;
  return clamp(extraDeducted / 100, 0, 1);
}

export function calculateTakeHome(input: CalculatorInput): CalculatorResult {
  const core = computeCore(input);
  const days = input.daysPerWeek || 5;
  const gross = toPeriods(core.grossAnnual, days);
  const netTakeHome = toPeriods(core.netAnnual, days);
  const effectiveTaxRate =
    core.grossAnnual > 0
      ? clamp((core.grossAnnual - core.netAnnual) / core.grossAnnual, 0, 1)
      : 0;

  return {
    gross,
    personalAllowance: core.personalAllowance,
    taxableIncome: core.taxableIncome,
    incomeTax: core.incomeTax,
    incomeTaxBands: core.incomeTaxBands,
    nationalInsurance: core.nationalInsurance,
    studentLoan: core.studentLoan,
    postgraduateLoan: core.postgraduateLoan,
    pensionContribution: core.pensionContribution,
    pensionFromNetPay: core.pensionFromNetPay,
    otherSalarySacrifice: core.otherSalarySacrifice,
    totalDeductions: core.totalDeductions,
    netTakeHome,
    employerNi: core.employerNi,
    trueCostToEmployer: roundPence(core.grossAnnual + core.employerNi),
    effectiveTaxRate,
    marginalTaxRate: estimateMarginalRate(input),
    employmentIncomeForTax: core.employmentIncomeForTax,
    employmentIncomeForNi: core.employmentIncomeForNi,
  };
}

export function defaultInput(
  overrides: Partial<CalculatorInput> = {},
): CalculatorInput {
  return {
    amount: 50_000,
    period: "annual",
    hoursPerWeek: 37.5,
    daysPerWeek: 5,
    taxYear: "2026-27",
    region: "england_wales_ni",
    taxCode: "1257L",
    ageBand: "under_state_pension",
    niCategory: "A",
    pensionMode: "percent",
    pensionValue: 0,
    pensionMethod: "salary_sacrifice",
    studentLoan: "none",
    postgraduateLoan: false,
    blindPersonsAllowance: false,
    marriageAllowance: false,
    otherIncome: 0,
    otherSalarySacrifice: 0,
    includeEmployerNi: false,
    ...overrides,
  };
}
