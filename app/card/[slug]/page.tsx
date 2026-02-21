import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mail, Phone, Globe } from 'lucide-react'
import Image from 'next/image'

export default async function BusinessCardPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: card } = await supabase
    .from('business_cards')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!card) {
    notFound()
  }

  // Track view (optional - could add IP tracking here)
  await supabase.from('business_card_views').insert({
    card_id: card.id,
  })

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          {card.avatar_url && (
            <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
              <Image
                src={card.avatar_url}
                alt={card.full_name}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold">{card.full_name}</h1>
          {card.title && (
            <p className="text-lg text-muted-foreground">{card.title}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {card.bio && (
            <p className="text-center text-muted-foreground">{card.bio}</p>
          )}

          <div className="space-y-3">
            {card.email && (
              <a
                href={`mailto:${card.email}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Mail className="h-5 w-5 text-primary" />
                <span>{card.email}</span>
              </a>
            )}

            {card.phone && (
              <a
                href={`tel:${card.phone}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Phone className="h-5 w-5 text-primary" />
                <span>{card.phone}</span>
              </a>
            )}

            {card.website && (
              <a
                href={card.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Globe className="h-5 w-5 text-primary" />
                <span>{card.website}</span>
              </a>
            )}
          </div>

          {card.qr_code_url && (
            <div className="mt-8 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Scan to save contact
              </p>
              <div className="mx-auto inline-block rounded-lg border p-4">
                <Image
                  src={card.qr_code_url}
                  alt="QR Code"
                  width={200}
                  height={200}
                />
              </div>
            </div>
          )}

          <div className="pt-6 text-center text-sm text-muted-foreground">
            <p>
              Powered by{' '}
              <a href="/" className="text-primary hover:underline">
                AveronSoft
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
