'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mail, Phone, Globe, FileImage, FileText } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'

export function BusinessCardStateless() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null)
  const [cardsPerPage, setCardsPerPage] = useState<1 | 2 | 4 | 6 | 8 | 10>(10)
  const [showQr, setShowQr] = useState(true)

  const cardData = {
    fullName: fullName.trim(),
    title: title.trim(),
    bio: bio.trim(),
    email: email.trim(),
    phone: phone.trim(),
    website: website.trim(),
  }

  const hasContent = cardData.fullName || cardData.title || cardData.bio || cardData.email || cardData.phone || cardData.website

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!hasContent) {
      setQrDataUrl(null)
      return
    }
    const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/\n/g, '\\n')
    const parts: string[] = ['BEGIN:VCARD', 'VERSION:3.0']
    if (cardData.fullName) {
      const names = cardData.fullName.trim().split(/\s+/)
      const last = names.pop() || ''
      const first = names.join(' ') || ''
      parts.push(`N:${esc(last)};${esc(first)};;;`)
      parts.push(`FN:${esc(cardData.fullName)}`)
    }
    if (cardData.title) parts.push(`TITLE:${esc(cardData.title)}`)
    if (cardData.phone) parts.push(`TEL:${cardData.phone}`)
    if (cardData.email) parts.push(`EMAIL:${cardData.email}`)
    if (cardData.website) parts.push(`URL:${cardData.website}`)
    if (cardData.bio) parts.push(`NOTE:${esc(cardData.bio)}`)
    parts.push('END:VCARD')
    const vcard = parts.join('\n')
    QRCode.toDataURL(vcard, { width: 80, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [hasContent, cardData.fullName, cardData.title, cardData.bio, cardData.email, cardData.phone, cardData.website])

  const captureCard = async () => {
    const el = cardRef.current
    if (!el) return null
    return html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      // Skip SVGs - Lucide icons can trigger "lab" color parse errors in html2canvas
      ignoreElements: (node) => node.tagName === 'svg' || node.closest?.('svg'),
    })
  }

  const handleExportPNG = async () => {
    if (!hasContent) return
    setExporting('png')
    try {
      const canvas = await captureCard()
      if (!canvas) return
      const link = document.createElement('a')
      link.download = `business-card-${cardData.fullName || 'card'}.png`.replace(/\s+/g, '-')
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setExporting(null)
    }
  }

  const handleExportPDF = async () => {
    if (!hasContent) return
    setExporting('pdf')
    try {
      const canvas = await captureCard()
      if (!canvas) return
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 10
      const usableW = pageW - margin * 2
      const usableH = pageH - margin * 2

      // Standard business card: 85mm x 55mm. Max 2 per row on A4 portrait (190mm usable width).
      const cardW = 85
      const cardH = 55
      const cols = cardsPerPage === 1 ? 1 : 2
      const rows = Math.ceil(cardsPerPage / cols)
      const count = cardsPerPage

      // Distribute gaps evenly between cards
      const gapX = cols > 1 ? (usableW - cols * cardW) / (cols + 1) : 0
      const gapY = rows > 1 ? (usableH - rows * cardH) / (rows + 1) : 0

      const pixelToMm = 25.4 / 96
      const imgW_mm = canvas.width * pixelToMm
      const imgH_mm = canvas.height * pixelToMm
      // Scale image to fit within 85x55, preserving aspect ratio
      const scale = Math.min(cardW / imgW_mm, cardH / imgH_mm)
      const w = imgW_mm * scale
      const h = imgH_mm * scale
      const padX = (cardW - w) / 2
      const padY = (cardH - h) / 2

      for (let i = 0; i < count; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = margin + gapX + col * (cardW + gapX) + padX
        const y = margin + gapY + row * (cardH + gapY) + padY
        pdf.addImage(imgData, 'PNG', x, y, w, h)
      }

      pdf.save(`business-card-${cardData.fullName || 'card'}.pdf`.replace(/\s+/g, '-'))
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Disclaimer - prominent */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
        <strong>We do not store your card data.</strong> Everything you enter stays in your browser. Export your card when ready — no account needed.
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Your details</h2>
            <p className="text-sm text-muted-foreground">
              Fill in your professional details. Preview updates as you type.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1.5">
                Job Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Software Engineer"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1.5">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief professional bio..."
                className={`${inputClass} resize-y min-h-[80px]`}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium mb-1.5">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className={inputClass}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview + Export */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Preview</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your card as it will appear when exported.
            </p>
          </div>

          {/* Card preview - 85:55 aspect ratio (standard business card), inline styles for html2canvas */}
          <div
            ref={cardRef}
            style={{
              width: 340,
              aspectRatio: '85 / 55',
              padding: 24,
              backgroundColor: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {!hasContent ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0', fontSize: 12 }}>
                Enter your details to see a preview
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'flex-start', minHeight: 0 }}>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                      {cardData.fullName || 'Your Name'}
                    </h3>
                    {cardData.title && (
                      <p style={{ fontSize: 11, color: '#4b5563', marginTop: 1 }}>{cardData.title}</p>
                    )}
                  </div>
                  {cardData.bio && (
                    <p style={{ color: '#4b5563', fontSize: 10, lineHeight: 1.3, margin: 0 }}>
                      {cardData.bio}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {cardData.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151', fontSize: 10 }}>
                        <Mail style={{ width: 10, height: 10, color: '#6b7280', flexShrink: 0 }} />
                        <span>{cardData.email}</span>
                      </div>
                    )}
                    {cardData.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151', fontSize: 10 }}>
                        <Phone style={{ width: 10, height: 10, color: '#6b7280', flexShrink: 0 }} />
                        <span>{cardData.phone}</span>
                      </div>
                    )}
                    {cardData.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151', fontSize: 10 }}>
                        <Globe style={{ width: 10, height: 10, color: '#6b7280', flexShrink: 0 }} />
                        <span>{cardData.website}</span>
                      </div>
                    )}
                  </div>
                </div>
                {showQr && qrDataUrl && (
                  <div style={{ flexShrink: 0 }}>
                    <img
                      src={qrDataUrl}
                      alt="Scan to save contact"
                      width={64}
                      height={64}
                      style={{ display: 'block' }}
                    />
                    <p style={{ fontSize: 8, color: '#6b7280', margin: '2px 0 0', textAlign: 'center' }}>
                      Scan to save
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PDF options - A4 portrait, 85×55mm cards, 10mm margins, max 10 cards (2×5) */}
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showQr}
                onChange={(e) => setShowQr(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm font-medium">Include QR code</span>
            </label>
            <div className="flex items-center gap-2">
              <label htmlFor="cards-per-page" className="text-sm font-medium">
                Cards per page (A4, 85×55mm):
              </label>
              <select
                id="cards-per-page"
                value={cardsPerPage}
                onChange={(e) => setCardsPerPage(Number(e.target.value) as 1 | 2 | 4 | 6 | 8 | 10)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={10}>10 (max)</option>
              </select>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportPNG}
              disabled={!hasContent || !!exporting}
              variant="secondary"
            >
              <FileImage className="h-4 w-4 mr-2" />
              {exporting === 'png' ? 'Exporting...' : 'Export PNG'}
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={!hasContent || !!exporting}
              variant="secondary"
            >
              <FileText className="h-4 w-4 mr-2" />
              {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Explanation - below tool (400–600 words) */}
      <section className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground mb-4">About this tool</h2>
        <p>
          The business card tool lets you create a professional card, preview it live, and export it as PNG or PDF. A QR code encodes your contact details in vCard format so recipients can scan and save you to their phone. All processing happens in your browser. Nothing is sent to a server or stored. You enter your details, see the preview update as you type, and download when ready. No account is required.
        </p>
        <p>
          The card uses the standard ISO size (85mm × 55mm), so it fits common print templates and cutters. For PDF export, you can choose how many cards per A4 page (1 to 10), with 10mm margins on all sides. PNG export gives you a single high-resolution image suitable for digital use or custom print layouts.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">How it works</h3>
        <p>
          You fill in your name, title, bio, email, phone, and website. The preview updates in real time. A QR code is generated from your contact data in vCard format; scanning it opens the phone&apos;s contact app with your details pre-filled. When you export to PNG, the tool captures the preview (including the QR) as an image and triggers a download. For PDF, it places your card image on an A4 page at 85×55mm per card, with spacing calculated from the margins. Up to 10 cards fit on one A4 portrait page in a 2×5 grid.
        </p>
        <p>
          The export uses your browser&apos;s rendering. No data leaves your device. When you close the tab or navigate away, everything is discarded. This makes the tool suitable for sensitive contact details or one-off cards.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Practical examples</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Networking events: create a card, export 10 per page, and print at home or a print shop.</li>
          <li>Freelancers and consultants: generate a card for proposals or client handouts without design software.</li>
          <li>Conference badges: export PNG and add to badge templates or design tools.</li>
          <li>Email signatures: use the PNG in your email client as a contact block.</li>
          <li>Quick handouts: print a few cards for meetings or trade shows.</li>
          <li>Digital sharing: export PNG and attach to emails, messages, or profiles.</li>
          <li>Scan to save: recipients scan the QR code to add your contact to their phone.</li>
        </ul>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Limitations</h3>
        <p>
          The tool offers a single layout: name, title, bio, and contact fields. You cannot change fonts, colors, or add logos or images. The design is minimal by design. For heavily branded or custom layouts, use a design tool instead.
        </p>
        <p>
          PDF export uses A4 portrait only. If your printer expects a different size or orientation, you may need to adjust in your print dialog. Print quality depends on your printer and paper. The tool does not support bleed or crop marks; for professional print runs, consult your print provider. Cards are not saved or shareable via a link; you must export and distribute the file yourself.
        </p>
      </section>
    </div>
  )
}
