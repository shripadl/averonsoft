import { RegExplainClient } from '@/components/tools/regex-explainer/RegExplainClient'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'

export const metadata = {
  title: 'RegExplain embed | Averonsoft',
  description:
    'Embeddable regex explainer and tester. Same tool as RegExplain in a minimal layout for iframes.',
  robots: { index: false, follow: true },
}

export default async function RegexExplainerEmbedPage() {
  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'regexexplainer')

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="RegExplain" />
    }
    return <ToolDisabledPage toolName="RegExplain" />
  }

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4">
      <h1 className="sr-only">RegExplain</h1>
      <RegExplainClient embed showFlavorSelector />
    </div>
  )
}
