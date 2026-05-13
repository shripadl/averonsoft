'use client'

import { useCallback, useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Crop, Grid2x2, Sparkles } from 'lucide-react'
import { ResizeTab } from './ResizeTab'
import { SplitTab } from './SplitTab'
import { BackgroundRemovalTab } from './BackgroundRemovalTab'
import { ACCEPTED_TYPES, fileToImageData, MAX_SIZE_MB } from './shared'

type Tab = 'resize' | 'split' | 'background'

const TABS: { id: Tab; label: string; icon: typeof Crop; description: string }[] = [
  { id: 'resize', label: 'Resize', icon: Crop, description: 'Smart, crop, or pad' },
  { id: 'split', label: 'Split', icon: Grid2x2, description: 'Grid or tiled output' },
  { id: 'background', label: 'Remove BG', icon: Sparkles, description: 'AI background removal' },
]

export function SmartImageResizerClient() {
  const [file, setFile] = useState<File | null>(null)
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [tab, setTab] = useState<Tab>('resize')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadImage = useCallback(async (f: File) => {
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB}MB`)
      return
    }
    setError(null)
    try {
      const data = await fileToImageData(f)
      setImageData(data)
      setFile(f)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load image')
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
        <strong>Your images never leave your device.</strong> All processing happens locally in your browser — resize,
        split, and background removal all run on your own hardware.
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Upload</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) loadImage(f)
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {file && imageData && (
              <p className="mt-1 text-sm text-muted-foreground">
                {file.name} ({imageData.width} × {imageData.height})
              </p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {imageData && (
        <>
          <div
            role="tablist"
            aria-label="Image tools"
            className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-1"
          >
            {TABS.map((t) => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={
                    'inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
                    (active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-surface')
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{t.label}</span>
                  <span className="hidden text-xs opacity-70 sm:inline">· {t.description}</span>
                </button>
              )
            })}
          </div>

          {tab === 'resize' && <ResizeTab key={`r-${imageData.width}x${imageData.height}`} imageData={imageData} />}
          {tab === 'split' && <SplitTab key={`s-${imageData.width}x${imageData.height}`} imageData={imageData} />}
          {tab === 'background' && (
            <BackgroundRemovalTab key={`b-${imageData.width}x${imageData.height}`} imageData={imageData} />
          )}
        </>
      )}

      <section className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground mb-4">About this tool</h2>
        <p>
          The Smart Image Toolkit bundles three privacy-friendly image utilities. Everything runs in your browser; nothing
          is uploaded.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Resize</h3>
        <p>
          Content-aware (seam carving) resize that keeps subjects intact when changing aspect ratios. Brush over faces,
          logos, or text to protect them. Crop and pad modes are also available for quick fixed-size output.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Split</h3>
        <p>
          Cut an image into a grid of equal panels (perfect for an Instagram 3×3 feed grid or a swipeable 3-panel
          carousel), or tile it into fixed-size chunks. Each tile is exported individually and a single zip download is
          provided for convenience.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Background removal</h3>
        <p>
          Uses an ONNX segmentation model (ISNet) running on WebAssembly with optional WebGPU acceleration. The model
          weights are fetched once on first use and then cached by the browser. Output can be saved with a transparent
          background (PNG/WebP) or composited onto a solid color (any format).
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Limitations</h3>
        <p>
          Maximum source file size is {MAX_SIZE_MB} MB. Supported formats: JPEG, PNG, WebP. For very large resizes,
          seam carving is preceded by a downscale step to avoid distortion and keep the operation responsive. Background
          removal speed scales with image dimensions; downscale very large photos first for the fastest results.
        </p>
      </section>
    </div>
  )
}
