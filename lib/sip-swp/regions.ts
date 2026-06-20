export type RegionKey = 'USA' | 'UK' | 'EU' | 'IND'
export type CalcMode = 'INVEST' | 'DRAWDOWN'

export interface RegionConfig {
  symbol: string
  pdfSym: string
  termInv: string
  termDraw: string
  desc: string
  inflation: number
  taxRate: number
}

export interface TaxCard {
  eyebrow: string
  title: string
  body: string
  url: string
}

export const REGIONS: Record<RegionKey, RegionConfig> = {
  USA: {
    symbol: '$',
    pdfSym: 'USD ',
    termInv: 'Monthly ETF/401k',
    termDraw: 'Roth IRA / 401k Drawdown',
    desc: 'S&P 500 ETFs, Dividends & Tax-Advantaged Withdrawals',
    inflation: 2.5,
    taxRate: 15.0,
  },
  UK: {
    symbol: '£',
    pdfSym: 'GBP ',
    termInv: 'Index Funds / ISA',
    termDraw: 'ISA / Pension Tax Drawdown',
    desc: 'Stocks & Shares ISA compounding & Tax-free cash limits',
    inflation: 2.8,
    taxRate: 20.0,
  },
  EU: {
    symbol: '€',
    pdfSym: 'EUR ',
    termInv: 'UCITS ETF / Accumulator',
    termDraw: 'Capital Drawdown Strategy',
    desc: 'Eurozone diversified UCITS compounding trackers',
    inflation: 2.2,
    taxRate: 26.0,
  },
  IND: {
    symbol: '₹',
    pdfSym: 'INR ',
    termInv: 'Systematic Investment (SIP)',
    termDraw: 'Systematic Withdrawal (SWP)',
    desc: 'Equity Mutual Funds compounding & monthly fixed-sum liquidations',
    inflation: 5.0,
    taxRate: 12.5,
  },
}

export const TAX_DB: Record<RegionKey, TaxCard[]> = {
  USA: [
    {
      eyebrow: 'Statutory Framework',
      title: 'IRS Code Title 26 — Tax-Advantaged Investment Vehicles',
      body: 'Governs the legal operations of qualified retirement plans under United States federal tax laws. Includes stipulations on tax deferral timelines and asset compounding parameters.',
      url: 'https://www.irs.gov/retirement-plans',
    },
    {
      eyebrow: 'Annual Contribution Ceilings',
      title: '401(k) Employee Cap: $23,500  |  Traditional/Roth IRA Limit: $7,000',
      body: 'Statutory caps set by the Internal Revenue Service. Exceeding these thresholds triggers a mandatory 6% excise penalty tax on excess contributions every year until corrected.',
      url: 'https://www.irs.gov/retirement-plans/cola-increases-for-dollar-limitations-on-benefits-and-contributions',
    },
    {
      eyebrow: 'Early Withdrawal Penalties',
      title: '10% IRS Excise Penalty — Distributions Before Age 59½',
      body: 'Withdrawing tax-deferred balances early incurs standard income taxation plus an additional 10% statutory penalty, unless passing selective exclusions (SEPP, medical emergencies, or first-time home purchases up to $10,000).',
      url: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-tax-on-early-distributions',
    },
  ],
  UK: [
    {
      eyebrow: 'Statutory Framework',
      title: 'HMRC Section 33 — Individual Savings Accounts & Pension Schemes',
      body: 'Statutory guidelines enabling tax-sheltered wealth building for UK residents. Ensures protection against capital appreciation levies within approved wrappers.',
      url: 'https://www.gov.uk/individual-savings-accounts',
    },
    {
      eyebrow: 'Annual Contribution Ceilings',
      title: 'Individual Savings Account (ISA) Cap: £20,000 Yearly Allocation',
      body: 'The limit can be split across Stocks & Shares ISAs, Cash ISAs, or Innovative Finance ISAs. Allocations roll over on April 6th and do not accrue into subsequent tax years if left unused.',
      url: 'https://www.gov.uk/individual-savings-accounts/how-isas-work',
    },
    {
      eyebrow: 'Capital Gains Tax',
      title: 'Annual CGT Exempt Amount & Dividend Allowance',
      body: 'Outside of ISA wrappers, gains above the annual exempt amount are subject to CGT at 10% (basic rate) or 20% (higher rate) for investment assets. Dividends are taxed separately with a personal allowance.',
      url: 'https://www.gov.uk/capital-gains-tax',
    },
  ],
  EU: [
    {
      eyebrow: 'Statutory Framework',
      title: 'Cross-Border Eurozone UCITS Directive V/VI & National Income Directives',
      body: 'Sovereign financial regulatory architecture enabling secure cross-border fund distribution throughout European Union member states with standardised investor protection rules.',
      url: 'https://finance.ec.europa.eu/capital-markets-union-and-financial-markets_en',
    },
    {
      eyebrow: 'Withholding Tax',
      title: 'Dividend & Interest Withholding Tax by Member State',
      body: 'EU member states levy withholding taxes on cross-border dividend and interest payments, typically ranging from 15%–26%. Reduced rates may apply under double taxation treaties.',
      url: 'https://ec.europa.eu/taxation_customs/taxation-1/personal-taxation_en',
    },
    {
      eyebrow: 'Reporting Requirements',
      title: 'CRS & DAC6 Cross-Border Arrangement Disclosure',
      body: 'The Common Reporting Standard and EU Directive DAC6 require automatic exchange of financial account information between member states to combat tax evasion and improve transparency.',
      url: 'https://www.oecd.org/tax/automatic-exchange/',
    },
  ],
  IND: [
    {
      eyebrow: 'Statutory Framework',
      title: 'Income Tax Act, 1961 — Section 80C & Capital Gains Schedules',
      body: 'Primary operational legal system overseeing direct income tax collection, statutory deductions, and variable long-term fiscal asset tracking across equity and debt instruments.',
      url: 'https://incometaxindia.gov.in',
    },
    {
      eyebrow: 'Long-Term Capital Gains',
      title: 'LTCG Tax: 10% on Equity Gains Above ₹1 Lakh Per Year',
      body: 'Equity mutual funds and listed shares held for over 12 months attract LTCG at 10% on gains exceeding ₹1,00,000 in a financial year. Short-term gains (under 12 months) attract 15% STCG.',
      url: 'https://incometaxindia.gov.in/Pages/i-want-to/know-about-capital-gain.aspx',
    },
    {
      eyebrow: 'Section 80C Deductions',
      title: 'Annual Deduction Cap: ₹1,50,000 Under Section 80C',
      body: 'Investments in ELSS mutual funds, PPF, NSC, and life insurance premiums are eligible for deduction up to ₹1.5 lakh per year, reducing taxable income under the old tax regime.',
      url: 'https://incometaxindia.gov.in/Pages/i-want-to/know-about-tax-saving-investments.aspx',
    },
  ],
}

export const REGION_FLAGS: Record<RegionKey, string> = {
  USA: '🇺🇸',
  UK: '🇬🇧',
  EU: '🇪🇺',
  IND: '🇮🇳',
}
