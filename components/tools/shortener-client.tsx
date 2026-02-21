'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { createShortUrl, deleteShortUrl } from '@/lib/actions/shortener'
import { Copy, Trash2, BarChart3, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ShortUrl {
  id: string
  short_code: string
  original_url: string
  click_count: number
  created_at: string
}

export function ShortenerClient({ initialUrls }: { initialUrls: ShortUrl[] }) {
  const router = useRouter()
  const [urls, setUrls] = useState<ShortUrl[]>(initialUrls)
  const [submitting, setSubmitting] = useState(false)
  const [originalUrl, setOriginalUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [generatedUrl, setGeneratedUrl] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setGeneratedUrl('')

    const formData = new FormData()
    formData.append('originalUrl', originalUrl)
    if (customCode) formData.append('customCode', customCode)

    const result = await createShortUrl(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      const shortUrl = `${window.location.origin}/s/${result.shortCode}`
      setGeneratedUrl(shortUrl)
      toast.success('Short URL created successfully!')
      setOriginalUrl('')
      setCustomCode('')
      router.refresh()
    }

    setSubmitting(false)
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url)
    toast.success('Copied to clipboard!')
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this short URL?')) return

    const result = await deleteShortUrl(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Short URL deleted')
      setUrls(urls.filter(u => u.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">URL Shortener</h1>
        <p className="text-muted-foreground">
          Create short, trackable links with detailed analytics
        </p>
      </div>

      {/* Create Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Short URL</CardTitle>
          <CardDescription>
            Enter a long URL to generate a short link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="originalUrl" className="block text-sm font-medium mb-2">
                Original URL *
              </label>
              <input
                id="originalUrl"
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very-long-url"
                className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="customCode" className="block text-sm font-medium mb-2">
                Custom Code (optional)
              </label>
              <input
                id="customCode"
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="my-custom-code"
                pattern="[a-zA-Z0-9-_]+"
                className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Only letters, numbers, hyphens, and underscores
              </p>
            </div>

            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Short URL'
              )}
            </Button>
          </form>

          {generatedUrl && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium mb-2">Your short URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background px-3 py-2 rounded border text-sm break-all">
                  {generatedUrl}
                </code>
                <Button size="sm" onClick={() => handleCopy(generatedUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* URLs List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Short URLs</h2>
        
        {urls.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ExternalLink className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No short URLs yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Create your first short URL using the form above
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {urls.map((url) => (
              <Card key={url.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-medium text-primary">
                          /s/{url.short_code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(`${window.location.origin}/s/${url.short_code}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {url.original_url}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{url.click_count || 0} clicks</span>
                        <span>Created {new Date(url.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(url.original_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toast.info('Analytics coming soon!')}
                      >
                        <BarChart3 className="h-4 w-4" />
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
