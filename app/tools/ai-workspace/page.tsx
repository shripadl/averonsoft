import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AIWorkspaceClient } from '@/components/tools/ai-workspace-client'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'

export default async function AIWorkspacePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'aiworkspace')
  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="AI Code Workspace" />
    }
    return <ToolDisabledPage toolName="AI Code Workspace" />
  }

  const [filesResult, groqResult] = await Promise.all([
    supabase
      .from('ai_workspace_files')
      .select('*')
      .eq('user_id', user.id)
      .eq('workspace_id', 'default')
      .order('file_path'),
    (async () => {
      const serviceClient = createServiceClient()
      const { data } = await serviceClient
        .from('admin_settings')
        .select('value')
        .eq('key', 'groq_ai_enabled')
        .single()
      return data?.value === true || data?.value === 'true'
    })(),
  ])

  const { data: files } = filesResult
  const aiEnabled = groqResult

  return (
    <div className="mx-auto max-w-[1920px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">AI Code Workspace</h1>
        <p className="mt-2 text-foreground-secondary">
          Edit code with Monaco, chat with AI, and apply changes with one click.
        </p>
      </div>

      <AIWorkspaceClient initialFiles={files || []} aiEnabled={aiEnabled} />
    </div>
  )
}
