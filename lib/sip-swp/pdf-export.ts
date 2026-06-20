import { jsPDF } from 'jspdf'
import type { YearlyRow } from './calculator'
import { formatMoney } from './format'
import { REGIONS, type RegionKey } from './regions'

export const SITE_BRAND = 'averonsoft.com'

export const ILLUSTRATION_DISCLAIMER =
  'This tool provides algorithmic projections for illustration purposes only. It is not financial, tax, or legal advice. Regulatory rules change over time — verify figures with a qualified adviser before making decisions.'

/** Same-origin font — avoids CDN failures and CORS issues in the browser. */
const NOTO_SANS_PATH = '/fonts/NotoSans-Regular.ttf'
const NOTO_VFS_NAME = 'NotoSans-Regular.ttf'
const NOTO_FONT_FAMILY = 'NotoSans'

let cachedFontBase64: string | null | undefined

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

function hasNotoSans(doc: jsPDF): boolean {
  const list = doc.getFontList()
  return NOTO_FONT_FAMILY in list
}

/** Load Noto Sans once; returns true when PDF can render currency symbols. */
export async function loadPdfUnicodeFont(): Promise<boolean> {
  if (cachedFontBase64 !== undefined) return cachedFontBase64 !== null
  try {
    const res = await fetch(NOTO_SANS_PATH)
    if (!res.ok) {
      cachedFontBase64 = null
      return false
    }
    cachedFontBase64 = arrayBufferToBase64(await res.arrayBuffer())
    return true
  } catch {
    cachedFontBase64 = null
    return false
  }
}

export function applyPdfUnicodeFont(doc: jsPDF): boolean {
  if (!cachedFontBase64) return false
  try {
    if (!hasNotoSans(doc)) {
      doc.addFileToVFS(NOTO_VFS_NAME, cachedFontBase64)
      doc.addFont(NOTO_VFS_NAME, NOTO_FONT_FAMILY, 'normal')
    }
    doc.setFont(NOTO_FONT_FAMILY, 'normal')
    return hasNotoSans(doc)
  } catch {
    return false
  }
}

export function pdfMoney(region: RegionKey, val: number, useSymbols: boolean): string {
  const cfg = REGIONS[region]
  const prefix = useSymbols ? cfg.symbol : cfg.pdfSym
  return formatMoney(prefix, val)
}

function hexRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function setFill(doc: jsPDF, hex: string) {
  const [r, g, b] = hexRgb(hex)
  doc.setFillColor(r, g, b)
}

function setStroke(doc: jsPDF, hex: string) {
  const [r, g, b] = hexRgb(hex)
  doc.setDrawColor(r, g, b)
}

function setText(doc: jsPDF, hex: string) {
  const [r, g, b] = hexRgb(hex)
  doc.setTextColor(r, g, b)
}

function setBodyFont(doc: jsPDF, symbolsOk: boolean) {
  if (symbolsOk) {
    applyPdfUnicodeFont(doc)
  } else {
    doc.setFont('helvetica', 'normal')
  }
}

export function stampPdfBranding(doc: jsPDF, pageHeight = 792, symbolsOk = false) {
  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    setBodyFont(doc, symbolsOk)
    doc.setFontSize(8)
    setText(doc, '#888888')
    doc.text(SITE_BRAND, 612 - 40, 22, { align: 'right' })
    doc.setFontSize(7)
    setText(doc, '#aaaaaa')
    doc.text(`${SITE_BRAND} — illustrative projection only`, 306, pageHeight - 18, { align: 'center' })
  }
}

export function drawPdfPortfolioChart(
  doc: jsPDF,
  yearlyData: YearlyRow[],
  taxOn: boolean,
  ML: number,
  y: number,
  CW: number
): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  setText(doc, '#2b2b2b')
  doc.text('Portfolio growth projection', ML, y)
  y += 14

  const chartH = 160
  const padL = 56
  const padB = 28
  const padT = 14
  const padR = 10
  const plotW = CW - padL - padR
  const plotH = chartH - padT - padB
  const cx0 = ML + padL
  const cy0 = y + padT

  const maxVal = Math.max(...yearlyData.map((d) => d.principal + d.growth), 1)
  const n = yearlyData.length

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  setStroke(doc, '#e0e0e0')
  doc.setLineWidth(0.5)
  for (let i = 0; i <= 3; i++) {
    const ratio = i / 3
    const gy = cy0 + plotH * (1 - ratio)
    doc.line(cx0, gy, cx0 + plotW, gy)
    const v = maxVal * ratio
    const lbl =
      v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`
    setText(doc, '#888888')
    doc.text(lbl, cx0 - 4, gy + 2.5, { align: 'right' })
  }

  const bGap = Math.max(1, Math.floor(plotW * 0.012))
  const bW = Math.max(2, Math.floor((plotW - bGap * (n - 1)) / n))

  yearlyData.forEach((d, i) => {
    const bx = cx0 + i * (bW + bGap)
    const pH2 = (d.principal / maxVal) * plotH
    const gH2 = (d.growth / maxVal) * plotH
    const tH2 = (d.tax / maxVal) * plotH
    const baseY = cy0 + plotH

    setFill(doc, '#1f77b4')
    doc.setLineWidth(0)
    doc.rect(bx, baseY - pH2, bW, pH2, 'F')
    setFill(doc, '#2ca02c')
    doc.rect(bx, baseY - pH2 - gH2, bW, gH2, 'F')
    if (taxOn && d.tax > 0) {
      setFill(doc, '#d32f2f')
      doc.rect(bx, baseY - pH2 - gH2, bW, tH2, 'F')
    }
    if (n <= 15 || i % Math.ceil(n / 5) === 0) {
      doc.setFontSize(7)
      setText(doc, '#888888')
      doc.text(`Y${i + 1}`, bx + bW / 2, baseY + 10, { align: 'center' })
    }
  })

  const ly = cy0 + chartH - 6
  const legendItems = [
    { color: '#1f77b4', label: 'Capital basis' },
    { color: '#2ca02c', label: 'Compound growth' },
  ]
  if (taxOn) legendItems.push({ color: '#d32f2f', label: 'Est. tax drag' })

  let lx = cx0
  legendItems.forEach((item) => {
    setFill(doc, item.color)
    doc.rect(lx, ly - 7, 9, 7, 'F')
    doc.setFontSize(8)
    setText(doc, '#444444')
    doc.text(item.label, lx + 12, ly - 1)
    lx += doc.getTextWidth(item.label) + 26
  })

  return y + chartH + 20
}

export function drawPdfDisclaimer(doc: jsPDF, ML: number, y: number, CW: number, PH: number): number {
  if (y + 50 > PH - 40) {
    doc.addPage()
    y = 40
  }
  setFill(doc, '#fdecea')
  doc.rect(ML, y, CW, 52, 'F')
  setStroke(doc, '#e57373')
  doc.setLineWidth(0.5)
  doc.rect(ML, y, CW, 52, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  setText(doc, '#b71c1c')
  doc.text('Disclaimer — illustration only, not financial advice', ML + 8, y + 13)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  setText(doc, '#7f1d1d')
  const lines = doc.splitTextToSize(ILLUSTRATION_DISCLAIMER, CW - 16)
  doc.text(lines, ML + 8, y + 25)
  return y + 60
}

export interface SipSwpPdfParams {
  region: RegionKey
  modeLabel: string
  inflationOn: boolean
  taxOn: boolean
  yearlyData: YearlyRow[]
  last: YearlyRow
}

export function buildSipSwpPdf(params: SipSwpPdfParams): jsPDF {
  const { region, modeLabel, inflationOn, taxOn, yearlyData, last } = params
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
  const symbolsOk = applyPdfUnicodeFont(doc)

  const PW = 612
  const PH = 792
  const ML = 40
  const MR = 40
  const CW = PW - ML - MR
  let y = 40

  const fmt = (val: number) => pdfMoney(region, val, symbolsOk)

  setBodyFont(doc, symbolsOk)
  doc.setFontSize(8)
  setText(doc, '#888888')
  doc.text(SITE_BRAND, PW - MR, y, { align: 'right' })
  y += 6

  doc.setFontSize(20)
  setText(doc, '#1f538d')
  doc.text('SIP/SWP Portfolio Report', ML, y + 18)
  y += 28

  doc.setFontSize(9)
  setText(doc, '#888888')
  doc.text(
    `Region: ${region}  |  Mode: ${modeLabel}  |  Inflation: ${inflationOn}  |  Tax drag: ${taxOn}`,
    ML,
    y
  )
  y += 24

  setStroke(doc, '#dddddd')
  doc.setLineWidth(0.5)
  doc.line(ML, y, PW - MR, y)
  y += 16

  const rows: [string, string][] = [
    ['Principal / Asset Pool', fmt(last.principal)],
    ['Growth / Withdrawals', fmt(last.growth)],
    ['Est. Tax Drag', fmt(last.tax)],
    ['Net Terminal Value', fmt(last.net)],
  ]
  const col1W = 320
  const rowH = 20

  doc.setFontSize(11)
  setText(doc, '#2b2b2b')
  doc.text('Summary', ML, y)
  y += 12

  rows.forEach(([label, val], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(249, 249, 249)
      doc.rect(ML, y, CW, rowH, 'F')
    }
    setStroke(doc, '#dcdcdc')
    doc.rect(ML, y, CW, rowH, 'S')
    setBodyFont(doc, symbolsOk)
    doc.setFontSize(i === 3 ? 11 : 10)
    setText(doc, '#222222')
    doc.text(label, ML + 6, y + 14)
    doc.text(val, ML + col1W, y + 14)
    y += rowH
  })
  y += 16

  y = drawPdfPortfolioChart(doc, yearlyData, taxOn, ML, y, CW)

  setBodyFont(doc, symbolsOk)
  doc.setFontSize(11)
  setText(doc, '#2b2b2b')
  doc.text('Year-by-year ledger', ML, y)
  y += 14

  doc.setFontSize(8)
  doc.text('Year', ML + 4, y)
  doc.text('Principal', ML + 50, y)
  doc.text('Growth', ML + 150, y)
  doc.text('Tax', ML + 250, y)
  doc.text('Net', ML + 340, y)
  y += 10

  doc.setFontSize(9)
  yearlyData.forEach((d, i) => {
    if (y > PH - 80) {
      doc.addPage()
      y = 40
    }
    if (i % 2 === 0) {
      doc.setFillColor(249, 249, 249)
      doc.rect(ML, y - 8, CW, 14, 'F')
    }
    setBodyFont(doc, symbolsOk)
    doc.text(`Y${d.year}`, ML + 4, y)
    doc.text(fmt(d.principal), ML + 50, y)
    doc.text(fmt(d.growth), ML + 150, y)
    doc.text(fmt(d.tax), ML + 250, y)
    doc.text(fmt(d.net), ML + 340, y)
    y += 14
  })
  y += 8

  drawPdfDisclaimer(doc, ML, y, CW, PH)
  stampPdfBranding(doc, PH, symbolsOk)

  return doc
}
