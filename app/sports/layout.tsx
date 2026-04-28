import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolDisabledPage } from '@/components/tool-disabled-page'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'

export default async function SportsLayout({ children }: { children: React.ReactNode }) {
  const toolSettings = await getToolSettings()
  const settings = toolSettings['sportanalytics']
  const publicVisible = settings?.visible !== false
  const { maintenance } = isToolAccessible(toolSettings, 'sportanalytics')

  // Public visibility gate: hides Sports pages while backend cron/ingestion can keep running.
  if (!publicVisible) {
    return <ToolDisabledPage toolName="Sports Analytics" />
  }
  if (maintenance) {
    return <ToolMaintenancePage toolName="Sports Analytics" />
  }

  return <>{children}</>
}
