'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, LayoutDashboard } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

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

export function SuperAdminClient() {
  const [groqEnabled, setGroqEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchGroq = async () => {
    const res = await fetch('/api/super-admin/groq')
    if (res.ok) {
      const { enabled } = await res.json()
      setGroqEnabled(enabled === true)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchGroq()
  }, [])

  const updateGroq = async (enabled: boolean) => {
    const res = await fetch('/api/super-admin/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    })
    const data = await res.json()
    if (res.ok) {
      setGroqEnabled(enabled)
      toast.success('Groq AI setting updated')
    } else {
      toast.error(data.error || 'Failed to update')
    }
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
          <CardTitle>AI Tool (Groq)</CardTitle>
          <CardDescription>
            Enable or disable the Groq-powered AI assistant for all users. When disabled, the AI tool UI remains visible but inputs are disabled with a message.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Groq AI enabled for all users</span>
            <Toggle
              checked={groqEnabled}
              onChange={updateGroq}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Console</CardTitle>
          <CardDescription>
            Users, Tools, APIs, Maintenance, and other platform settings are in the Admin Console. You need an admin or super_admin role in your profile to access it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin">
            <Button variant="secondary">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Open Admin Console
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
