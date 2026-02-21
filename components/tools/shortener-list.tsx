'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { ShortUrl } from '@/lib/types/database'

interface ShortenerListProps {
  initialUrls: ShortUrl[]
}

export function ShortenerList({ initialUrls }: ShortenerListProps) {
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this short URL?')) return

    try {
      const { error } = await supabase.from('short_urls').delete().eq('id', id)
      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error('Error deleting URL:', error)
      alert('Error deleting URL')
    }
  }

  const handleCopy = (shortCode: string) => {
    const url = `${window.location.origin}/s/${shortCode}`
    navigator.clipboard.writeText(url)
    alert('Copied to clipboard!')
  }

  if (initialUrls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Short URLs</CardTitle>
          <CardDescription>No short URLs yet. Create your first one!</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Short URLs</CardTitle>
        <CardDescription>Manage and track your shortened links</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {initialUrls.map((url) => (
            <div
              key={url.id}
              className="flex items-start justify-between rounded-lg border p-4"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{url.title || 'Untitled'}</p>
                  {!url.is_active && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {url.original_url}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-mono">/s/{url.short_code}</span>
                  <span>{formatDateTime(url.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCopy(url.short_code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(`/s/${url.short_code}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDelete(url.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
