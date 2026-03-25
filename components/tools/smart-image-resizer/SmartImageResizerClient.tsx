'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2, Download, Eraser, Pencil, Trash2 } from 'lucide-react'
import { MaskCanvas } from './MaskCanvas'
import { PreviewSlider } from './PreviewSlider'
import { resizeImage, type ResizeMode } from '@/lib/smart-image-resizer/resize-engine'

const PRESETS = [
  { id: 'instagram', label: 'Instagram Post', w: 1080, h: 1080 },
  { id: 'youtube', label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { id: 'twitter', label: 'Twitter Header', w: 1500, h: 500 },
  { id: 'linkedin', label: 'LinkedIn Banner', w: 1584, h: 396 },
  { id: 'custom', label: 'Custom', w: 0, h: 0 },
] as const

const ACCEPT = 'image/jpeg,image/png,image/webp'
const MAX_SIZE_MB = 10

function imageDataToDataUrl(imageData: ImageData, format: 'image/png' | 'image/jpeg' | 'image/webp', quality?: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)
  if (format === 'image/jpeg' && quality !== undefined) {
    return canvas.toDataURL(format, quality)
  }
  if (format === 'image/webp' && quality !== undefined) {
    return canvas.toDataURL(format, quality)
  }
  return canvas.toDataURL(format)
}

export function SmartImageResizerClient() {
  const [file, setFile] = useState<File | null>(null)
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [resultData, setResultData] = useState<ImageData | null>(null)
  const [mask, setMask] = useState<Uint8Array | null>(null)
  const [targetW, setTargetW] = useState(1080)
  const [targetH, setTargetH] = useState(1080)
  const [preset, setPreset] = useState<string>('instagram')
  const [mode, setMode] = useState<ResizeMode>('smart')
  const [brushSize, setBrushSize] = useState(20)
  const [eraseMode, setEraseMode] = useState(false)
  const [padColor, setPadColor] = useState('#ffffff')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressTotal, setProgressTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [downloadQuality, setDownloadQuality] = useState(0.92)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadImage = useCallback(async (f: File) => {
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB}MB`)
      return
    }
    setError(null)
    const img = new Image()
    const url = URL.createObjectURL(f)
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = url
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
      setImageData(data)
      setResultData(null)
      setMask(null)
      setFile(f)
      const p = PRESETS.find((x) => x.id === preset)
      if (p && p.w > 0) {
        setTargetW(p.w)
        setTargetH(p.h)
      }
    } finally {
      URL.revokeObjectURL(url)
    }
  }, [preset])

  const handlePresetChange = (id: string) => {
    setPreset(id)
    const p = PRESETS.find((x) => x.id === id)
    if (p && p.w > 0) {
      setTargetW(p.w)
      setTargetH(p.h)
    }
  }

  const handleResize = useCallback(async () => {
    if (!imageData) return
    setLoading(true)
    setError(null)
    setProgress(0)
    setProgressTotal(0)
    try {
      const result = await resizeImage(
        imageData,
        {
          mode,
          targetWidth: targetW,
          targetHeight: targetH,
          mask: mode === 'smart' ? mask : null,
          padColor,
        },
        (p) => {
          setProgress(p.progress)
          setProgressTotal(p.total)
        }
      )
      setResultData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Resize failed')
    } finally {
      setLoading(false)
    }
  }, [imageData, mode, targetW, targetH, mask, padColor])

  const handleDownload = useCallback(() => {
    if (!resultData) return
    const format = downloadFormat === 'jpeg' ? 'image/jpeg' : downloadFormat === 'webp' ? 'image/webp' : 'image/png'
    const quality = format !== 'image/png' ? downloadQuality : undefined
    const url = imageDataToDataUrl(resultData, format, quality)
    const a = document.createElement('a')
    a.href = url
    a.download = `resized.${downloadFormat === 'jpeg' ? 'jpg' : downloadFormat}`
    a.click()
  }, [resultData, downloadFormat, downloadQuality])

  const originalUrl = imageData ? imageDataToDataUrl(imageData, 'image/png') : ''
  const resultUrl = resultData ? imageDataToDataUrl(resultData, 'image/png') : ''

  const maxPreviewDim = 400
  const scale = imageData
    ? Math.min(1, maxPreviewDim / Math.max(imageData.width, imageData.height))
    : 1
  const displayW = imageData ? Math.round(imageData.width * scale) : 0
  const displayH = imageData ? Math.round(imageData.height * scale) : 0

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
        <strong>Your images never leave your device.</strong> All processing happens locally in your browser.
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Upload & Settings</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) loadImage(f)
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {file && (
              <p className="mt-1 text-sm text-muted-foreground">
                {file.name} ({imageData?.width} × {imageData?.height})
              </p>
            )}
          </div>

          {imageData && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Target size</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.id}
                      variant={preset === p.id ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => handlePresetChange(p.id)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Width</label>
                    <input
                      type="number"
                      min={1}
                      max={4096}
                      value={targetW}
                      onChange={(e) => setTargetW(Number(e.target.value))}
                      className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm ml-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Height</label>
                    <input
                      type="number"
                      min={1}
                      max={4096}
                      value={targetH}
                      onChange={(e) => setTargetH(Number(e.target.value))}
                      className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm ml-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Resize mode</label>
                <div className="flex gap-2">
                  {(['smart', 'crop', 'pad'] as const).map((m) => (
                    <Button
                      key={m}
                      variant={mode === m ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setMode(m)}
                    >
                      {m === 'smart' && 'Smart (content-aware)'}
                      {m === 'crop' && 'Crop'}
                      {m === 'pad' && 'Pad'}
                    </Button>
                  ))}
                </div>
              </div>

              {mode === 'pad' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Pad color</label>
                  <input
                    type="color"
                    value={padColor}
                    onChange={(e) => setPadColor(e.target.value)}
                    className="h-10 w-20 rounded border border-input cursor-pointer"
                  />
                </div>
              )}

              {mode === 'smart' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Protect areas (optional)</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Brush over faces, logos, or text to prevent them from being removed.
                  </p>
                  <div className="flex items-center gap-4 mb-2">
                    <Button
                      variant={!eraseMode ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setEraseMode(false)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Protect
                    </Button>
                    <Button
                      variant={eraseMode ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setEraseMode(true)}
                    >
                      <Eraser className="h-4 w-4 mr-1" />
                      Erase
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setMask(null)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear mask
                    </Button>
                    <label className="text-sm">
                      Brush: {brushSize}px
                      <input
                        type="range"
                        min={5}
                        max={80}
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="ml-2 w-24"
                      />
                    </label>
                  </div>
                  <div className="relative inline-block rounded-lg border border-border overflow-hidden" style={{ width: displayW, height: displayH }}>
                    <img
                      src={imageDataToDataUrl(imageData, 'image/png')}
                      alt="Source"
                      width={displayW}
                      height={displayH}
                      className="block absolute inset-0 w-full h-full object-none"
                      style={{ maxWidth: 'none', objectPosition: '0 0' }}
                    />
                    <div className="absolute inset-0" style={{ width: displayW, height: displayH }}>
                      <MaskCanvas
                        width={imageData.width}
                        height={imageData.height}
                        displayWidth={displayW}
                        displayHeight={displayH}
                        mask={mask}
                        onMaskChange={(m) => setMask(m)}
                        brushSize={brushSize}
                        eraseMode={eraseMode}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleResize} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resizing... {progressTotal > 0 ? `${progress}/${progressTotal}` : ''}
                  </>
                ) : (
                  'Resize'
                )}
              </Button>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {resultData && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Result</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Your resized image ({resultData.width}×{resultData.height}). Use the Download button below to save.
              </p>
              <div className="rounded-lg border border-border bg-muted/30 overflow-hidden inline-block max-w-full">
                <img
                  src={resultUrl}
                  alt="Resized result"
                  className="block max-h-[400px] w-auto h-auto object-contain"
                  style={{ maxWidth: '100%' }}
                  draggable={false}
                />
              </div>
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Before / After comparison</summary>
              <div className="mt-2">
                <PreviewSlider
                  beforeUrl={originalUrl}
                  afterUrl={resultUrl}
                  beforeLabel="Original"
                  afterLabel="Resized"
                  width={resultData.width}
                  height={resultData.height}
                />
              </div>
            </details>
            <div>
              <label className="block text-sm font-medium mb-2">Download</label>
              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'jpeg' | 'webp')}
                  className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                </select>
                {(downloadFormat === 'jpeg' || downloadFormat === 'webp') && (
                  <label className="text-sm">
                    Quality: {Math.round(downloadQuality * 100)}%
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={downloadQuality}
                      onChange={(e) => setDownloadQuality(Number(e.target.value))}
                      className="ml-2 w-24"
                    />
                  </label>
                )}
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground mb-4">About this tool</h2>
        <p>
          Smart Image Resizer uses content-aware resizing (seam carving) to change image dimensions without stretching or cropping important content. You can protect faces, logos, or text by brushing over them. All processing happens in your browser. Nothing is uploaded.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">How it works</h3>
        <p>
          The algorithm computes an energy map from pixel gradients, finds the lowest-energy paths (seams) across the image, and removes them. Protected areas get maximum energy so they are never removed. Crop mode center-crops to the target size. Pad mode adds borders.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">When to use it</h3>
        <p>
          Use smart resize when you need a different aspect ratio but want to keep the subject intact—e.g. converting a portrait photo to square for Instagram, or fitting a banner to LinkedIn dimensions. Use crop for quick center crops. Use pad when you need exact dimensions with letterboxing.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Limitations</h3>
        <p>
          For large reductions (e.g. 2680×1701 to 1080×1080), the tool first scales down then applies seam carving to avoid distortion and speed up processing. Seam carving works best when removing up to ~40% of width or height per step; larger changes are scaled first. Supported formats: JPEG, PNG, WebP.
        </p>
      </section>
    </div>
  )
}
