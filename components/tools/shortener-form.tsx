'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { generateShortCode } from '@/lib/utils/short-code'
import { isValidUrl } from '@/lib/utils'

export function ShortenerForm() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValidUrl(url)) {
      alert('Please enter a valid URL')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const shortCode = generateShortCode(7)
      
      const { error } = await supabase.from('short_urls').insert({
        user_id: user.id,
        original_url: url,
        short_code: shortCode,
        title: title || null,
      })

      if (error) throw error

      const shortUrl = `${window.location.origin}/s/${shortCode}`
      setResult(shortUrl)
      setUrl('')
      setTitle('')
      
      // Refresh the page to show new URL
      window.location.reload()
    } catch (error) {
      console.error('Error creating short URL:', error)
      alert('Error creating short URL. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Short Link</CardTitle>
        <CardDescription>
          Enter a long URL to shorten it
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              Long URL *
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title (optional)
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Campaign Link"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Shorten URL'}
          </Button>

          {result && (
            <div className="rounded-md bg-primary/10 p-4">
              <p className="text-sm font-medium mb-2">Your short URL:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={result}
                  readOnly
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(result)
                    alert('Copied to clipboard!')
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
