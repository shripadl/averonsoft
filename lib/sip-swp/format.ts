export function formatMoney(symbol: string, val: number): string {
  return (
    symbol +
    val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  )
}

export function formatMoneyPdf(pdfSym: string, val: number): string {
  return (
    pdfSym +
    val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  )
}
