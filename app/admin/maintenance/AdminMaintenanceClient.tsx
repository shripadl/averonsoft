'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const TOOL_MAINTENANCE_KEYS = [
  { key: 'businesscard_maintenance', name: 'Business Card' },
  { key: 'aiworkspace_maintenance', name: 'AI Code Workspace' },
  { key: 'daw_maintenance', name: 'DAW' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
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

function getBool(settings: Record<string, unknown>, key: string): boolean {
  const v = settings[key]
  if (v === true || v === 'true') return true
  if (typeof v === 'string' && v.startsWith('"')) return JSON.parse(v) === true
  return false
}

function getStr(settings: Record<string, unknown>, key: string): string {
  const v = settings[key]
  if (typeof v === 'string') return v.startsWith('"') ? JSON.parse(v) : v
  return ''
}

export function AdminMaintenanceClient() {
  const [settings, setSettings] = useState<Record<string, unknown>>({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    if (res.ok) {
      setSettings(data.settings || {})
      setMessage(getStr(data.settings || {}, 'maintenance_message'))
    }
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

  const saveMessage = () => {
    updateSetting('maintenance_message', message)
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
          <CardTitle>Global Maintenance</CardTitle>
          <CardDescription>When enabled, the entire platform shows a maintenance message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Global maintenance mode</span>
            <Toggle
              checked={getBool(settings, 'global_maintenance')}
              onChange={v => updateSetting('global_maintenance', v)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Maintenance message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onBlur={saveMessage}
              placeholder="We are performing scheduled maintenance..."
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-Tool Maintenance</CardTitle>
          <CardDescription>Put individual tools in maintenance mode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {TOOL_MAINTENANCE_KEYS.map(({ key, name }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium">{name}</span>
              <Toggle
                checked={getBool(settings, key)}
                onChange={v => updateSetting(key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
