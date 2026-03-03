import { CharacterCounterClient } from '@/components/tools/character-counter-client'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'

export const metadata = {
  title: 'Character & Word Counter | Averonsoft Tools',
  description:
    'Count characters, words, sentences, and paragraphs in real time. No signup. No data stored. All processing in your browser.',
}

export default async function CharacterCounterPage() {
  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'charactercounter')

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="Character Counter" />
    }
    return <ToolDisabledPage toolName="Character Counter" />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Character & Word Counter</h1>
        <p className="mt-1 text-muted-foreground">
          Count characters, words, sentences, and paragraphs. No signup required.
        </p>
      </div>

      <CharacterCounterClient />
    </div>
  )
}
