'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const TOOLS = [
  { id: 'pdfconverter', name: 'PDF Converter', key: 'pdfconverter' },
  { id: 'charactercounter', name: 'Character Counter', key: 'charactercounter' },
  { id: 'jsonformatter', name: 'JSON Formatter', key: 'jsonformatter' },
  { id: 'smartimageresizer', name: 'Smart Image Resizer', key: 'smartimageresizer' },
  { id: 'businesscard', name: 'Business Card', key: 'businesscard' },
  { id: 'aiworkspace', name: 'AI Code Workspace', key: 'aiworkspace' },
  { id: 'daw', name: 'DAW', key: 'daw' },
  { id: 'regexexplainer', name: 'RegExplain', key: 'regexexplainer' },
  { id: 'sportanalytics', name: 'Sports Analytics', key: 'sportanalytics' },
  { id: 'practiceexams', name: 'Practice Exams', key: 'practiceexams' },
]

function Toggle({
  checked,
  onChange,
  disabled,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
        checked ? 'bg-primary border-primary' : 'bg-muted border-border'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function AdminToolsClient() {
  const [settings, setSettings] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    if (res.ok) setSettings(data.settings || {})
    setLoading(false)
  }

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

  useEffect(() => {
    fetchSettings()
  }, [])

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
          <CardTitle>AI Tool (Groq)</CardTitle>
          <CardDescription>
            Enable or disable the Groq-powered AI assistant for all users. When disabled, the AI tool UI remains visible but inputs are disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Groq AI enabled</span>
            <Toggle
              checked={get('groq_ai_enabled')}
              onChange={v => updateSetting('groq_ai_enabled', v)}
            />
          </div>
        </CardContent>
      </Card>

      {TOOLS.map((tool) => (
        <Card key={tool.id}>
          <CardHeader>
            <CardTitle>{tool.name}</CardTitle>
            <CardDescription>
              {tool.key === 'sportanalytics'
                ? 'Use Public visibility to hide/show Sports pages while background data collection continues.'
                : 'Configure visibility and availability'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enabled</span>
              <Toggle
                checked={get(`tool_${tool.key}_enabled`)}
                onChange={v => updateSetting(`tool_${tool.key}_enabled`, v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {tool.key === 'sportanalytics' ? 'Public visibility' : 'Visible (public)'}
              </span>
              <Toggle
                checked={get(`tool_${tool.key}_visible`)}
                onChange={v => updateSetting(`tool_${tool.key}_visible`, v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Maintenance mode</span>
              <Toggle
                checked={get(`${tool.key}_maintenance`)}
                onChange={v => updateSetting(`${tool.key}_maintenance`, v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Beta access</span>
              <Toggle
                checked={get(`tool_${tool.key}_beta`)}
                onChange={v => updateSetting(`tool_${tool.key}_beta`, v)}
              />
            </div>
            {tool.key === 'sportanalytics' ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">History/results visible to public</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keeps ingestion/predictions running in background but hides prediction history vs
                    actual comparison from public pages.
                  </p>
                </div>
                <Toggle
                  checked={get('sports_history_public_visible')}
                  onChange={v => updateSetting('sports_history_public_visible', v)}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
