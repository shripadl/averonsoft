import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DAWClient } from '@/components/tools/daw-client'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'

export default async function DAWPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'daw')
  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="DAW" />
    }
    return <ToolDisabledPage toolName="DAW" />
  }

  return (
    <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-4">
      <div className="mb-2 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Digital Audio Workstation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record, mix, and export. Multi-track with timeline, mixer, and stem export.
          </p>
        </div>
      </div>

      <div className="daw-panel rounded-xl overflow-hidden">
        <DAWClient />
      </div>
    </div>
  )
}
