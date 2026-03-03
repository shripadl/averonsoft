import { createClient } from '@/lib/supabase/server'
import { HeaderClient } from './header-client'
import { getToolSettings, getVisibleTools } from '@/lib/tool-settings'

export async function Header() {
  const supabase = await createClient()
  const [userResult, toolSettings] = await Promise.all([
    supabase.auth.getUser(),
    getToolSettings(),
  ])

  const { data: { user } } = userResult
  const visibleTools = getVisibleTools(toolSettings)

  return <HeaderClient user={user} visibleTools={visibleTools} />
}
