import { BusinessCardStateless } from '@/components/tools/business-card-stateless'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'

export const metadata = {
  title: 'Digital Business Card | Averonsoft Tools',
  description:
    'Create a business card, preview it live, and export as PNG or PDF. No signup. No data stored. All processing in your browser.',
}

export default async function BusinessCardPage() {
  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'businesscard')

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="Business Card" />
    }
    return <ToolDisabledPage toolName="Business Card" />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Digital Business Card</h1>
        <p className="mt-2 text-muted-foreground">
          Create a business card, preview it, and export as PNG or PDF. No signup. No data stored.
        </p>
      </div>

      <BusinessCardStateless />
    </div>
  )
}
