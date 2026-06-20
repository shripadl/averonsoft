import { SipSwpClient } from '@/components/tools/sip-swp/SipSwpClient'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'

export const metadata = {
  title: 'SIP / SWP Calculator | Averonsoft Tools',
  description:
    'Project systematic investment (SIP) accumulation and withdrawal (SWP) plans. USA, UK, EU, and India presets. Inflation and tax adjustments. All calculations in your browser.',
}

export default async function SipSwpPage() {
  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'sipswp')

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="SIP / SWP Calculator" />
    }
    return <ToolDisabledPage toolName="SIP / SWP Calculator" />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">SIP / SWP Calculator</h1>
        <p className="mt-1 text-muted-foreground">
          Model monthly investment accumulation (SIP) or retirement drawdown (SWP) with optional
          inflation and tax adjustments. No signup. Nothing stored.
        </p>
      </div>

      <SipSwpClient />

      <section className="prose prose-sm dark:prose-invert mt-12 max-w-none text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">About this tool</h2>
        <p>
          A Systematic Investment Plan (SIP) spreads regular monthly contributions into a portfolio
          that compounds over time. A Systematic Withdrawal Plan (SWP) does the reverse: you start
          with a lump sum and withdraw a fixed amount each month while the remainder keeps growing.
          This calculator projects both scenarios year by year so you can see principal, returns,
          estimated tax drag, and net balance at each horizon.
        </p>
        <p>
          Choose a region preset — USA, UK, EU, or India — to label inputs appropriately (for
          example SIP/SWP for India, ISA or 401(k) language for other markets). Toggle inflation
          adjustment to see real (purchasing-power) values instead of nominal ones. Toggle capital
          gains tax drag to apply a simplified regional tax rate to gains or withdrawals. All math
          runs locally in your browser; no financial data is sent to a server.
        </p>
        <h3 className="text-base font-medium text-foreground">How the projection works</h3>
        <p>
          In accumulation mode, each month adds your contribution plus compound growth on the existing
          balance. If you set an annual step-up, the monthly contribution increases by that percentage
          every year. In drawdown mode, growth is applied to the remaining pool before your fixed
          monthly withdrawal is deducted. When the pool would go negative, withdrawals stop at zero.
          Year-end snapshots feed the chart and ledger table.
        </p>
        <p>
          Tax and inflation figures are illustrative defaults per region, not personalised advice.
          Export CSV or PDF reports for your own records, or use the Tax & Compliance tab for links
          to official regulatory sources. Always confirm limits and rates with a qualified adviser.
        </p>
      </section>
    </div>
  )
}
