import type { CalculatorInput } from "@payframe/lib/tax-engine";
import { defaultInput, getDefaultTaxYear } from "@payframe/lib/tax-engine";

const KEYS: (keyof CalculatorInput)[] = [
  "amount",
  "period",
  "hoursPerWeek",
  "daysPerWeek",
  "taxYear",
  "region",
  "taxCode",
  "ageBand",
  "niCategory",
  "pensionMode",
  "pensionValue",
  "pensionMethod",
  "studentLoan",
  "postgraduateLoan",
  "blindPersonsAllowance",
  "marriageAllowance",
  "otherIncome",
  "otherSalarySacrifice",
  "includeEmployerNi",
];

function serializeValue(value: CalculatorInput[keyof CalculatorInput]): string {
  if (typeof value === "boolean") return value ? "1" : "0";
  return String(value);
}

function parseValue(
  key: keyof CalculatorInput,
  raw: string,
): CalculatorInput[keyof CalculatorInput] | undefined {
  switch (key) {
    case "amount":
    case "hoursPerWeek":
    case "daysPerWeek":
    case "pensionValue":
    case "otherIncome":
    case "otherSalarySacrifice":
      return Number(raw);
    case "postgraduateLoan":
    case "blindPersonsAllowance":
    case "marriageAllowance":
    case "includeEmployerNi":
      return raw === "1" || raw === "true";
    default:
      return raw as CalculatorInput[keyof CalculatorInput];
  }
}

export function inputToSearchParams(input: CalculatorInput): URLSearchParams {
  const params = new URLSearchParams();
  const defaults = defaultInput({ taxYear: getDefaultTaxYear() });
  for (const key of KEYS) {
    const value = input[key];
    if (value === defaults[key]) continue;
    params.set(key, serializeValue(value));
  }
  return params;
}

export function searchParamsToInput(
  params: URLSearchParams,
): CalculatorInput {
  const base = defaultInput({ taxYear: getDefaultTaxYear() });
  for (const key of KEYS) {
    const raw = params.get(key);
    if (raw == null) continue;
    const parsed = parseValue(key, raw);
    if (parsed !== undefined && (typeof parsed !== "number" || Number.isFinite(parsed))) {
      Object.assign(base, { [key]: parsed });
    }
  }
  return base;
}
