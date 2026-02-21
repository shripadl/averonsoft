import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ADMIN_EMAILS = ['slimaye2026@gmail.com']

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    redirect('/')
  }

  const { data: settings } = await supabase
    .from('admin_settings')
    .select('*')
    .order('key')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Configure pricing and platform content
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Settings</CardTitle>
          <CardDescription>
            View and manage platform configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium">Key</th>
                  <th className="pb-3 text-left text-sm font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {settings?.map((setting) => (
                  <tr key={setting.id} className="border-b">
                    <td className="py-3 text-sm font-mono">{setting.key}</td>
                    <td className="py-3 text-sm">
                      {typeof setting.value === 'object'
                        ? JSON.stringify(setting.value)
                        : String(setting.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            To update settings, use the Supabase dashboard or API
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
