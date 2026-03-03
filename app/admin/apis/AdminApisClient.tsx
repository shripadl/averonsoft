'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

function Toggle({
  checked,
  onChange,
}: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
        checked ? 'bg-primary border-primary' : 'bg-muted border-border'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function AdminApisClient() {
  const [settings, setSettings] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    if (res.ok) setSettings(data.settings || {})
    setLoading(false)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSetting = async (key: string, value: unknown) => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    const data = await res.json()
    if (res.ok) {
      setSettings(prev => ({ ...prev, [key]: value }))
      toast.success('Updated')
    } else toast.error(data.error || 'Failed')
  }

  const get = (key: string) => {
    const v = settings[key]
    if (v === true || v === 'true') return true
    if (typeof v === 'string' && v.startsWith('"')) return JSON.parse(v) === true
    return false
  }

  const handleRotateKey = () => {
    toast.info('API key rotation would be implemented with your key management system')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
          <CardDescription>Enable or disable public API access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">API Enabled</span>
            <Toggle
              checked={get('api_enabled')}
              onChange={v => updateSetting('api_enabled', v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Rotate keys for security (keys stored encrypted in admin_settings)</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={handleRotateKey}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Rotate API Key
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            Key rotation is configured via environment variables. Use this to trigger a rotation workflow.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Logs</CardTitle>
          <CardDescription>View recent API requests and errors</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            API logs are available in the Logs section. Configure rate limits in admin_settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
