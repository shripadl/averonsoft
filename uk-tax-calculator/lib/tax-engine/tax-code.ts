/**
 * Parse UK PAYE tax codes into an effective personal allowance and special modes.
 *
 * Supports common codes: 1257L, BR, D0, D1, NT, 0T, K-codes.
 * Scottish (S) / Welsh (C) prefixes and marriage indicators (M/N) are stripped.
 */

export type TaxCodeMode =
  | "standard"
  | "basic_rate_only"
  | "higher_rate_only"
  | "additional_rate_only"
  | "no_tax"
  | "no_allowance";

export interface ParsedTaxCode {
  mode: TaxCodeMode;
  /** Allowance implied by the numeric part (can be negative for K codes). */
  allowance: number | null;
  raw: string;
}

export function parseTaxCode(
  code: string,
  fallbackAllowance: number,
): ParsedTaxCode {
  const raw = (code || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!raw) {
    return { mode: "standard", allowance: fallbackAllowance, raw: "" };
  }

  // Strip region prefixes and week/month emergency suffixes for parsing.
  let cleaned = raw.replace(/^[SC]/, "");
  cleaned = cleaned.replace(/([WM]1|X)$/i, "");

  if (cleaned === "BR") {
    return { mode: "basic_rate_only", allowance: 0, raw };
  }
  if (cleaned === "D0") {
    return { mode: "higher_rate_only", allowance: 0, raw };
  }
  if (cleaned === "D1") {
    return { mode: "additional_rate_only", allowance: 0, raw };
  }
  if (cleaned === "NT") {
    return { mode: "no_tax", allowance: 0, raw };
  }
  if (cleaned === "0T") {
    return { mode: "no_allowance", allowance: 0, raw };
  }

  // K-codes: negative allowance (add to taxable income).
  const kMatch = cleaned.match(/^K(\d+)/);
  if (kMatch) {
    const digits = Number(kMatch[1]);
    return { mode: "standard", allowance: -(digits * 10), raw };
  }

  // Standard numeric + letter codes, e.g. 1257L, 1257M, 1257N.
  const stdMatch = cleaned.match(/^(\d+)([A-Z]*)$/);
  if (stdMatch) {
    const digits = Number(stdMatch[1]);
    return { mode: "standard", allowance: digits * 10, raw };
  }

  return { mode: "standard", allowance: fallbackAllowance, raw };
}
