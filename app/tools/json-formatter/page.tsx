import { JsonFormatterClient } from '@/components/tools/json-formatter-client'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'

export const metadata = {
  title: 'JSON Formatter | Averonsoft Tools',
  description:
    'Format, minify, and validate JSON. Pretty-print with configurable indentation. All processing in your browser. No data stored.',
}

export default async function JsonFormatterPage() {
  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'jsonformatter')

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="JSON Formatter" />
    }
    return <ToolDisabledPage toolName="JSON Formatter" />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">JSON Formatter</h1>
        <p className="mt-1 text-muted-foreground">
          Format, minify, and validate JSON. No signup required.
        </p>
      </div>

      <JsonFormatterClient />
    </div>
  )
}
