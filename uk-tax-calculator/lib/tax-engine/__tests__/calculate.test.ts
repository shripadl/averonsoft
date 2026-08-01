import { describe, expect, it } from "vitest";
import {
  calculateTakeHome,
  defaultInput,
  parseTaxCode,
  toAnnual,
} from "../index";

describe("toAnnual", () => {
  it("converts monthly, weekly, daily and hourly pay", () => {
    expect(toAnnual(4_000, "monthly")).toBe(48_000);
    expect(toAnnual(1_000, "weekly")).toBe(52_000);
    expect(toAnnual(200, "daily", 37.5, 5)).toBe(52_000);
    expect(toAnnual(20, "hourly", 40, 5)).toBe(41_600);
  });
});

describe("parseTaxCode", () => {
  it("parses standard, BR, D0, D1, NT, 0T and K codes", () => {
    expect(parseTaxCode("1257L", 12_570).allowance).toBe(12_570);
    expect(parseTaxCode("BR", 12_570).mode).toBe("basic_rate_only");
    expect(parseTaxCode("D0", 12_570).mode).toBe("higher_rate_only");
    expect(parseTaxCode("D1", 12_570).mode).toBe("additional_rate_only");
    expect(parseTaxCode("NT", 12_570).mode).toBe("no_tax");
    expect(parseTaxCode("0T", 12_570).mode).toBe("no_allowance");
    expect(parseTaxCode("K500", 12_570).allowance).toBe(-5_000);
    expect(parseTaxCode("S1257L", 12_570).allowance).toBe(12_570);
  });
});

describe("England/Wales/NI income tax bands (2025-26)", () => {
  it("taxes a basic-rate salary correctly", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 50_000,
        taxYear: "2025-26",
        studentLoan: "none",
        pensionValue: 0,
      }),
    );
    // Taxable 37,430 all in basic band → £7,486
    expect(r.incomeTax).toBe(7_486);
    expect(r.personalAllowance).toBe(12_570);
    expect(r.nationalInsurance).toBeCloseTo(2_994.4, 1);
    expect(r.netTakeHome.annual).toBeCloseTo(39_519.6, 1);
  });

  it("applies higher rate above £50,270", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 60_000,
        taxYear: "2025-26",
        pensionValue: 0,
      }),
    );
    // Taxable 47,430: 37,700 @ 20% + 9,730 @ 40% = 7,540 + 3,892 = 11,432
    expect(r.incomeTax).toBe(11_432);
  });

  it("applies additional rate above £125,140", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 150_000,
        taxYear: "2025-26",
        pensionValue: 0,
      }),
    );
    // PA fully tapered. Taxable 150,000.
    // 37,700 @ 20% = 7,540
    // (125,140 - 37,700) = 87,440 @ 40% = 34,976
    // (150,000 - 125,140) = 24,860 @ 45% = 11,187
    // Total = 53,703
    expect(r.personalAllowance).toBe(0);
    expect(r.incomeTax).toBe(53_703);
  });
});

describe("Personal allowance taper", () => {
  it("leaves PA intact at exactly £100,000", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 100_000,
        taxYear: "2025-26",
        pensionValue: 0,
      }),
    );
    expect(r.personalAllowance).toBe(12_570);
  });

  it("halves PA between £100k and £125,140", () => {
    // £112,570 → £12,570 over threshold → reduce by £6,285 → PA £6,285
    const r = calculateTakeHome(
      defaultInput({
        amount: 112_570,
        taxYear: "2025-26",
        pensionValue: 0,
      }),
    );
    expect(r.personalAllowance).toBe(6_285);
  });

  it("removes PA entirely at £125,140+", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 125_140,
        taxYear: "2025-26",
        pensionValue: 0,
      }),
    );
    expect(r.personalAllowance).toBe(0);
  });
});

describe("Scottish bands", () => {
  it("uses starter rate for low Scottish taxable income", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 15_000,
        taxYear: "2025-26",
        region: "scotland",
        pensionValue: 0,
      }),
    );
    // Taxable 2,430 all in starter (limit 2,827) @ 19%
    expect(r.incomeTax).toBeCloseTo(2_430 * 0.19, 1);
    expect(r.incomeTaxBands[0]?.name).toBe("Starter rate");
  });

  it("differs from England at intermediate incomes", () => {
    const eng = calculateTakeHome(
      defaultInput({
        amount: 40_000,
        taxYear: "2025-26",
        region: "england_wales_ni",
        pensionValue: 0,
      }),
    );
    const sco = calculateTakeHome(
      defaultInput({
        amount: 40_000,
        taxYear: "2025-26",
        region: "scotland",
        pensionValue: 0,
      }),
    );
    expect(sco.incomeTax).not.toBe(eng.incomeTax);
    expect(sco.incomeTax).toBeGreaterThan(eng.incomeTax);
  });
});

describe("Student loan plans", () => {
  it("applies Plan 2 threshold for 2025-26", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 50_000,
        taxYear: "2025-26",
        studentLoan: "plan2",
        pensionValue: 0,
      }),
    );
    // (50,000 - 28,470) * 9% = 1,937.70
    expect(r.studentLoan).toBeCloseTo(1_937.7, 1);
  });

  it("applies Plan 1, 4 and 5 thresholds", () => {
    const p1 = calculateTakeHome(
      defaultInput({
        amount: 40_000,
        taxYear: "2026-27",
        studentLoan: "plan1",
        pensionValue: 0,
      }),
    );
    expect(p1.studentLoan).toBeCloseTo((40_000 - 26_900) * 0.09, 1);

    const p4 = calculateTakeHome(
      defaultInput({
        amount: 40_000,
        taxYear: "2026-27",
        studentLoan: "plan4",
        pensionValue: 0,
      }),
    );
    expect(p4.studentLoan).toBeCloseTo((40_000 - 33_795) * 0.09, 1);

    const p5 = calculateTakeHome(
      defaultInput({
        amount: 40_000,
        taxYear: "2026-27",
        studentLoan: "plan5",
        pensionValue: 0,
      }),
    );
    expect(p5.studentLoan).toBeCloseTo((40_000 - 25_000) * 0.09, 1);
  });

  it("ignores Plan 5 before 2026-27", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 40_000,
        taxYear: "2025-26",
        studentLoan: "plan5",
        pensionValue: 0,
      }),
    );
    expect(r.studentLoan).toBe(0);
  });

  it("adds postgraduate loan at 6%", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 40_000,
        taxYear: "2025-26",
        studentLoan: "none",
        postgraduateLoan: true,
        pensionValue: 0,
      }),
    );
    expect(r.postgraduateLoan).toBeCloseTo((40_000 - 21_000) * 0.06, 1);
  });
});

describe("NI categories", () => {
  it("charges category A at 8%/2%", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 60_000,
        taxYear: "2025-26",
        niCategory: "A",
        pensionValue: 0,
      }),
    );
    // (50,270 - 12,570) * 8% + (60,000 - 50,270) * 2%
    // = 37,700 * 0.08 + 9,730 * 0.02 = 3,016 + 194.6 = 3,210.6
    expect(r.nationalInsurance).toBeCloseTo(3_210.6, 1);
  });

  it("charges category B at reduced main rate", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 40_000,
        taxYear: "2025-26",
        niCategory: "B",
        pensionValue: 0,
      }),
    );
    expect(r.nationalInsurance).toBeCloseTo((40_000 - 12_570) * 0.0185, 1);
  });

  it("charges nothing for category C", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 50_000,
        taxYear: "2025-26",
        niCategory: "C",
        pensionValue: 0,
      }),
    );
    expect(r.nationalInsurance).toBe(0);
  });
});

describe("Pension methods", () => {
  it("salary sacrifice reduces both tax and NI", () => {
    const base = calculateTakeHome(
      defaultInput({
        amount: 50_000,
        taxYear: "2025-26",
        pensionValue: 0,
      }),
    );
    const ss = calculateTakeHome(
      defaultInput({
        amount: 50_000,
        taxYear: "2025-26",
        pensionMode: "percent",
        pensionValue: 5,
        pensionMethod: "salary_sacrifice",
      }),
    );
    expect(ss.pensionContribution).toBe(2_500);
    expect(ss.incomeTax).toBeLessThan(base.incomeTax);
    expect(ss.nationalInsurance).toBeLessThan(base.nationalInsurance);
    expect(ss.employmentIncomeForTax).toBe(47_500);
    expect(ss.employmentIncomeForNi).toBe(47_500);
  });

  it("net pay reduces tax but not NI", () => {
    const np = calculateTakeHome(
      defaultInput({
        amount: 50_000,
        taxYear: "2025-26",
        pensionMode: "percent",
        pensionValue: 5,
        pensionMethod: "net_pay",
      }),
    );
    expect(np.employmentIncomeForTax).toBe(47_500);
    expect(np.employmentIncomeForNi).toBe(50_000);
    expect(np.incomeTax).toBe(6_986);
    expect(np.nationalInsurance).toBeCloseTo(2_994.4, 1);
  });

  it("relief at source leaves tax/NI on full pay and deducts net contribution", () => {
    const ras = calculateTakeHome(
      defaultInput({
        amount: 50_000,
        taxYear: "2025-26",
        pensionMode: "percent",
        pensionValue: 5,
        pensionMethod: "relief_at_source",
      }),
    );
    expect(ras.employmentIncomeForTax).toBe(50_000);
    expect(ras.employmentIncomeForNi).toBe(50_000);
    expect(ras.incomeTax).toBe(7_486);
    expect(ras.pensionFromNetPay).toBe(2_000); // 80% of £2,500
    expect(ras.netTakeHome.annual).toBeCloseTo(39_519.6 - 2_000, 1);
  });
});

describe("Worked example regression", () => {
  it("£50k, England, Plan 2, 5% salary-sacrifice pension, 2025-26", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 50_000,
        taxYear: "2025-26",
        region: "england_wales_ni",
        taxCode: "1257L",
        studentLoan: "plan2",
        pensionMode: "percent",
        pensionValue: 5,
        pensionMethod: "salary_sacrifice",
      }),
    );

    // After 5% SS: earnings 47,500
    // PA 12,570 → taxable 34,930 → tax 6,986
    // NI (47,500 - 12,570) * 8% = 2,794.40
    // Student loan (47,500 - 28,470) * 9% = 1,712.70
    // Net = 47,500 - 6,986 - 2,794.40 - 1,712.70 = 36,006.90
    expect(r.incomeTax).toBe(6_986);
    expect(r.nationalInsurance).toBeCloseTo(2_794.4, 1);
    expect(r.studentLoan).toBeCloseTo(1_712.7, 1);
    expect(r.netTakeHome.annual).toBeCloseTo(36_006.9, 1);
    expect(r.effectiveTaxRate).toBeGreaterThan(0);
    expect(r.marginalTaxRate).toBeGreaterThan(0);
  });

  it("includes employer NI when requested", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 50_000,
        taxYear: "2025-26",
        includeEmployerNi: true,
        pensionValue: 0,
      }),
    );
    // (50,000 - 5,000) * 15% = 6,750
    expect(r.employerNi).toBe(6_750);
    expect(r.trueCostToEmployer).toBe(56_750);
  });

  it("adds blind person's allowance", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 30_000,
        taxYear: "2025-26",
        blindPersonsAllowance: true,
        pensionValue: 0,
      }),
    );
    expect(r.personalAllowance).toBe(12_570 + 3_130);
  });

  it("applies BR tax code with no personal allowance", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 30_000,
        taxYear: "2025-26",
        taxCode: "BR",
        pensionValue: 0,
      }),
    );
    expect(r.personalAllowance).toBe(0);
    expect(r.incomeTax).toBe(6_000);
  });

  it("excludes other income from NI but includes it for tax", () => {
    const r = calculateTakeHome(
      defaultInput({
        amount: 40_000,
        taxYear: "2025-26",
        otherIncome: 10_000,
        pensionValue: 0,
      }),
    );
    // Tax on 50,000 total income path (40k + 10k) with PA
    expect(r.incomeTax).toBe(7_486);
    // NI only on 40,000 employment
    expect(r.nationalInsurance).toBeCloseTo((40_000 - 12_570) * 0.08, 1);
  });
});
