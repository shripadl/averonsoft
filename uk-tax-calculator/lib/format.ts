export function formatGbp(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
