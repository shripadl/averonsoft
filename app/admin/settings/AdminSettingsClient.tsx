'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function getStr(settings: Record<string, unknown>, key: string): string {
  const v = settings[key]
  if (typeof v === 'string') return v.startsWith('"') ? JSON.parse(v) : v
  return ''
}

export function AdminSettingsClient() {
  const [settings, setSettings] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    contact_email: '',
    support_email: '',
    branding_text: '',
  })

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    if (res.ok) {
      setSettings(data.settings || {})
      setForm({
        contact_email: getStr(data.settings || {}, 'contact_email'),
        support_email: getStr(data.settings || {}, 'support_email'),
        branding_text: getStr(data.settings || {}, 'branding_text'),
      })
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

  const handleSave = () => {
    updateSetting('contact_email', form.contact_email)
    updateSetting('support_email', form.support_email)
    updateSetting('branding_text', form.branding_text)
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
          <CardTitle>Contact & Support</CardTitle>
          <CardDescription>Emails used for contact form and support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Contact email</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Support email</label>
            <input
              type="email"
              value={form.support_email}
              onChange={e => setForm(f => ({ ...f, support_email: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button onClick={handleSave}>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Platform branding text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Branding text</label>
            <input
              type="text"
              value={form.branding_text}
              onChange={e => setForm(f => ({ ...f, branding_text: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="Professional Tools for Modern Professionals"
            />
          </div>
          <Button onClick={handleSave}>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing (read-only)</CardTitle>
          <CardDescription>Pricing values - update via Supabase or API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            {Object.entries(settings)
              .filter(([k]) => k.startsWith('pricing_'))
              .map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="font-mono">{k}</span>
                  <span>{String(v)}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
