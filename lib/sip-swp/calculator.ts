import { REGIONS, type CalcMode, type RegionKey } from './regions'

export interface YearlyRow {
  year: number
  principal: number
  growth: number
  tax: number
  net: number
}

export interface CalcInputs {
  region: RegionKey
  mode: CalcMode
  amount: number
  rate: number
  years: number
  stepup: number
  lumpsum: number
  inflationOn: boolean
  taxOn: boolean
}

export interface CalcResult {
  yearlyData: YearlyRow[]
  metricLabels: [string, string, string]
}

export function runProjection(inputs: CalcInputs): CalcResult {
  const cfg = REGIONS[inputs.region]
  const years = Math.max(1, Math.round(inputs.years))
  const monthlyRate = (inputs.rate / 100) / 12
  const inflRate = inputs.inflationOn ? (cfg.inflation / 100) / 12 : 0
  const taxRate = inputs.taxOn ? cfg.taxRate / 100 : 0
  const yearlyData: YearlyRow[] = []

  if (inputs.mode === 'INVEST') {
    let fv = 0
    let totalInvested = 0
    let curMonthly = inputs.amount

    for (let m = 1; m <= years * 12; m++) {
      if (m > 1 && (m - 1) % 12 === 0) curMonthly *= 1 + inputs.stepup / 100
      const growth = fv * monthlyRate
      fv = fv + curMonthly + growth
      totalInvested += curMonthly
      if (inflRate > 0) fv /= 1 + inflRate

      if (m % 12 === 0) {
        const rawReturns = Math.max(0, fv - totalInvested)
        const taxDrag = rawReturns * taxRate
        const net = fv - taxDrag
        yearlyData.push({
          year: m / 12,
          principal: totalInvested,
          growth: rawReturns,
          tax: taxDrag,
          net,
        })
      }
    }

    return {
      yearlyData,
      metricLabels: ['Total Invested', 'Gross Returns', 'Est. Tax Drag'],
    }
  }

  const pool = inputs.lumpsum
  const monthly = inputs.amount
  let balance = pool
  let totalWithdrawn = 0

  for (let m = 1; m <= years * 12; m++) {
    if (balance > 0) {
      const growth = balance * monthlyRate
      balance = balance + growth - monthly
      totalWithdrawn += monthly
      if (balance < 0) {
        totalWithdrawn += balance
        balance = 0
      }
      if (inflRate > 0) balance /= 1 + inflRate
    }
    if (m % 12 === 0) {
      const taxDrag = totalWithdrawn * taxRate
      const net = Math.max(0, balance - taxDrag)
      yearlyData.push({
        year: m / 12,
        principal: pool,
        growth: totalWithdrawn,
        tax: taxDrag,
        net,
      })
    }
  }

  return {
    yearlyData,
    metricLabels: ['Asset Pool', 'Total Withdrawn', 'Est. Tax Drag'],
  }
}
