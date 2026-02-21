'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils/short-code'
import { generateQRCode } from '@/lib/utils/qr-code'
import type { BusinessCard } from '@/lib/types/database'
import { QrCode, ExternalLink, Trash2 } from 'lucide-react'

interface BusinessCardEditorProps {
  initialCards: BusinessCard[]
}

export function BusinessCardEditor({ initialCards }: BusinessCardEditorProps) {
  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim()) {
      alert('Please enter your full name')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const slug = generateSlug(fullName) + '-' + Date.now().toString().slice(-6)
      const cardUrl = `${window.location.origin}/card/${slug}`
      const qrCode = await generateQRCode(cardUrl)

      const { error } = await supabase.from('business_cards').insert({
        user_id: user.id,
        slug,
        full_name: fullName,
        title: title || null,
        bio: bio || null,
        email: email || null,
        phone: phone || null,
        website: website || null,
        qr_code_url: qrCode,
        social_links: {},
      })

      if (error) throw error

      setFullName('')
      setTitle('')
      setBio('')
      setEmail('')
      setPhone('')
      setWebsite('')
      
      window.location.reload()
    } catch (error) {
      console.error('Error creating business card:', error)
      alert('Error creating business card. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this business card?')) return

    try {
      const { error } = await supabase.from('business_cards').delete().eq('id', id)
      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error('Error deleting card:', error)
      alert('Error deleting card')
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Business Card</CardTitle>
          <CardDescription>Fill in your professional details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Job Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Software Engineer"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief professional bio..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium mb-2">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Business Card'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Business Cards</CardTitle>
          <CardDescription>
            {initialCards.length} card{initialCards.length !== 1 ? 's' : ''} created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialCards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No business cards yet. Create your first one!
            </p>
          ) : (
            <div className="space-y-4">
              {initialCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium">{card.full_name}</h3>
                    {card.title && (
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                    )}
                    <p className="text-xs text-muted-foreground font-mono">
                      /card/{card.slug}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {card.qr_code_url && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = card.qr_code_url!
                          link.download = `${card.slug}-qr.png`
                          link.click()
                        }}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(`/card/${card.slug}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
