'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Image,
  FileText,
  Merge,
  Split,
  Minimize2,
  ImagePlus,
  Loader2,
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'

const MODES = [
  { id: 'image', label: 'Image to PDF', icon: Image },
  { id: 'text', label: 'Text to PDF', icon: FileText },
  { id: 'merge', label: 'Merge PDF', icon: Merge },
  { id: 'split', label: 'Split PDF', icon: Split },
  { id: 'compress', label: 'Compress PDF', icon: Minimize2 },
  { id: 'pdf2img', label: 'PDF to Images', icon: ImagePlus },
] as const

type Mode = (typeof MODES)[number]['id']

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'

export function PdfConverterClient() {
  const [mode, setMode] = useState<Mode>('image')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image to PDF
  const [imageFiles, setImageFiles] = useState<File[]>([])

  // Text to PDF
  const [textContent, setTextContent] = useState('')

  // Merge / Split / Compress / PDF to Images
  const [pdfFiles, setPdfFiles] = useState<File[]>([])

  const reset = () => {
    setError(null)
    setImageFiles([])
    setTextContent('')
    setPdfFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImageToPdf = async () => {
    if (imageFiles.length === 0) {
      setError('Add at least one image')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 10

      for (let i = 0; i < imageFiles.length; i++) {
        if (i > 0) pdf.addPage()
        const { dataUrl, w: imgW, h: imgH } = await loadImage(imageFiles[i])
        const pixelToMm = 25.4 / 96
        const imgW_mm = imgW * pixelToMm
        const imgH_mm = imgH * pixelToMm
        const ratio = Math.min((pageW - margin * 2) / imgW_mm, (pageH - margin * 2) / imgH_mm)
        const w = imgW_mm * ratio
        const h = imgH_mm * ratio
        const x = (pageW - w) / 2
        const y = (pageH - h) / 2
        pdf.addImage(dataUrl, 'JPEG', x, y, w, h)
      }
      pdf.save('images-to-pdf.pdf')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create PDF')
    } finally {
      setLoading(false)
    }
  }

  const loadImage = (file: File): Promise<{ dataUrl: string; w: number; h: number }> =>
    new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.92),
          w: img.width,
          h: img.height,
        })
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })

  const handleTextToPdf = async () => {
    if (!textContent.trim()) {
      setError('Enter some text')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      const margin = 20
      const lineHeight = 6
      const maxW = pdf.internal.pageSize.getWidth() - margin * 2
      const lines = pdf.splitTextToSize(textContent, maxW)
      let y = margin
      const pageH = pdf.internal.pageSize.getHeight()

      for (const line of lines) {
        if (y + lineHeight > pageH - margin) {
          pdf.addPage()
          y = margin
        }
        pdf.text(line, margin, y)
        y += lineHeight
      }
      pdf.save('text-to-pdf.pdf')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create PDF')
    } finally {
      setLoading(false)
    }
  }

  const handleMergePdf = async () => {
    if (pdfFiles.length < 2) {
      setError('Add at least 2 PDFs to merge')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const merged = await PDFDocument.create()
      for (const file of pdfFiles) {
        const bytes = await file.arrayBuffer()
        const doc = await PDFDocument.load(bytes)
        const pages = await merged.copyPages(doc, doc.getPageIndices())
        for (const page of pages) merged.addPage(page)
      }
      const pdfBytes = await merged.save()
      downloadBlob(pdfBytes, 'merged.pdf')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to merge PDFs')
    } finally {
      setLoading(false)
    }
  }

  const handleSplitPdf = async () => {
    if (pdfFiles.length !== 1) {
      setError('Select exactly one PDF to split')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const bytes = await pdfFiles[0].arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const count = doc.getPageCount()
      for (let i = 0; i < count; i++) {
        const newDoc = await PDFDocument.create()
        const [page] = await newDoc.copyPages(doc, [i])
        newDoc.addPage(page)
        const pdfBytes = await newDoc.save()
        downloadBlob(pdfBytes, `page-${i + 1}.pdf`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to split PDF')
    } finally {
      setLoading(false)
    }
  }

  const handleCompressPdf = async () => {
    if (pdfFiles.length !== 1) {
      setError('Select one PDF to compress')
      return
    }
    setLoading(true)
    setError(null)
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
      const bytes = await pdfFiles[0].arrayBuffer()
      const doc = await pdfjsLib.getDocument(bytes).promise
      const count = doc.numPages
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 10

      for (let i = 1; i <= count; i++) {
        if (i > 1) pdf.addPage()
        const page = await doc.getPage(i)
        const scale = 2
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvas, canvasContext: ctx, viewport }).promise
        const imgData = canvas.toDataURL('image/jpeg', 0.85)
        const pixelToMm = 25.4 / 96
        const imgW_mm = canvas.width * pixelToMm
        const imgH_mm = canvas.height * pixelToMm
        const ratio = Math.min((pageW - margin * 2) / imgW_mm, (pageH - margin * 2) / imgH_mm)
        const w = imgW_mm * ratio
        const h = imgH_mm * ratio
        const x = (pageW - w) / 2
        const y = (pageH - h) / 2
        pdf.addImage(imgData, 'JPEG', x, y, w, h)
      }
      pdf.save('compressed.pdf')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to compress PDF')
    } finally {
      setLoading(false)
    }
  }

  const handlePdfToImages = async () => {
    if (pdfFiles.length !== 1) {
      setError('Select one PDF')
      return
    }
    setLoading(true)
    setError(null)
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
      const bytes = await pdfFiles[0].arrayBuffer()
      const doc = await pdfjsLib.getDocument(bytes).promise
      const count = doc.numPages
      for (let i = 1; i <= count; i++) {
        const page = await doc.getPage(i)
        const scale = 2
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvas, canvasContext: ctx, viewport }).promise
        const link = document.createElement('a')
        link.download = `page-${i}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to extract images')
    } finally {
      setLoading(false)
    }
  }

  const downloadBlob = (bytes: Uint8Array, name: string) => {
    const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }

  const runAction = () => {
    if (mode === 'image') handleImageToPdf()
    else if (mode === 'text') handleTextToPdf()
    else if (mode === 'merge') handleMergePdf()
    else if (mode === 'split') handleSplitPdf()
    else if (mode === 'compress') handleCompressPdf()
    else if (mode === 'pdf2img') handlePdfToImages()
  }

  const canRun =
    (mode === 'image' && imageFiles.length > 0) ||
    (mode === 'text' && textContent.trim()) ||
    ((mode === 'merge' || mode === 'split' || mode === 'compress' || mode === 'pdf2img') &&
      (mode === 'merge' ? pdfFiles.length >= 2 : pdfFiles.length === 1))

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
        <strong>We do not store your files.</strong> All processing happens in your browser. Nothing is uploaded.
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => {
          const Icon = m.icon
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id)
                reset()
              }}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                mode === m.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {m.label}
            </button>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">{MODES.find((m) => m.id === mode)?.label}</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'image' && (
            <>
              <p className="text-sm text-muted-foreground">Add images. They will become PDF pages in order.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                className={inputClass}
              />
              {imageFiles.length > 0 && (
                <p className="text-sm text-muted-foreground">{imageFiles.length} image(s) selected</p>
              )}
            </>
          )}

          {mode === 'text' && (
            <>
              <p className="text-sm text-muted-foreground">Enter or paste text. It will be converted to a PDF.</p>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter your text..."
                className={`${inputClass} min-h-[200px] resize-y`}
                rows={8}
              />
            </>
          )}

          {(mode === 'merge' || mode === 'split' || mode === 'compress' || mode === 'pdf2img') && (
            <>
              <p className="text-sm text-muted-foreground">
                {mode === 'merge' && 'Add 2 or more PDFs. They will be merged in order.'}
                {mode === 'split' && 'Select one PDF. Each page will be saved as a separate PDF.'}
                {mode === 'compress' && 'Select one PDF. Pages are re-rendered at 85% JPEG quality to reduce file size.'}
                {mode === 'pdf2img' && 'Select one PDF. Each page will be exported as a PNG image.'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple={mode === 'merge'}
                onChange={(e) => setPdfFiles(Array.from(e.target.files || []))}
                className={inputClass}
              />
              {pdfFiles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {pdfFiles.length} PDF(s) selected
                </p>
              )}
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={runAction} disabled={loading || !canRun}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Convert</>
            )}
          </Button>
        </CardContent>
      </Card>

      <section className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground mb-4">About this tool</h2>
        <p>
          The PDF converter handles common PDF tasks in your browser. Convert images or text to PDF. Merge multiple PDFs, split a PDF into separate files, compress file size, or extract pages as images. All processing runs locally. Nothing is uploaded or stored.
        </p>
        <p>
          Supported formats include JPEG, PNG, and other images for Image to PDF; plain text for Text to PDF. Merge combines PDFs in the order you add them. Split creates one PDF per page. Compress re-renders pages at 85% JPEG quality to reduce file size. PDF to Images exports each page as a PNG.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">How it works</h3>
        <p>
          Each mode uses client-side libraries: jsPDF for creating PDFs from images and text, pdf-lib for merge and split, and PDF.js for rendering. Your files never leave your device. Large files may take longer; very large PDFs might hit browser memory limits.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Practical examples</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Scan receipts: photograph them, add images, convert to a single PDF.</li>
          <li>Combine reports: merge several PDFs into one document.</li>
          <li>Extract pages: split a PDF to share only specific pages.</li>
          <li>Reduce email size: compress a PDF before sending.</li>
          <li>Create thumbnails: export PDF pages as images for previews.</li>
        </ul>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Limitations</h3>
        <p>
          Compress re-rasterizes pages, which may slightly reduce sharpness of text. Very large files (e.g. hundreds of pages) may cause the browser to slow or run out of memory. For Word to PDF conversion with format preservation, use Microsoft Word&apos;s Save as PDF instead.
        </p>
      </section>
    </div>
  )
}
