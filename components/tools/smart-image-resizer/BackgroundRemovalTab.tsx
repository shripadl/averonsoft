'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Download, Loader2 } from 'lucide-react'
import { PreviewSlider } from './PreviewSlider'
import {
  downloadBlob,
  formatExtension,
  formatToMime,
  imageDataToBlob,
  imageDataToDataUrl,
  type ImageFormat,
} from './shared'
import {
  compositeOnColor,
  removeImageBackground,
  type BackgroundRemovalModel,
} from '@/lib/smart-image-resizer/background-remover'

interface BackgroundRemovalTabProps {
  imageData: ImageData
}

const MODEL_OPTIONS: { value: BackgroundRemovalModel; label: string; description: string }[] = [
  { value: 'isnet_fp16', label: 'Balanced (default)', description: 'Best mix of speed and quality. ~45 MB download.' },
  { value: 'isnet', label: 'High quality', description: 'Sharpest edges, slowest. ~90 MB download.' },
  { value: 'isnet_quint8', label: 'Fast', description: 'Lower memory, lower quality. ~25 MB download.' },
]

type BgStyle = 'transparent' | 'color'

export function BackgroundRemovalTab({ imageData }: BackgroundRemovalTabProps) {
  const [model, setModel] = useState<BackgroundRemovalModel>('isnet_fp16')
  const [device, setDevice] = useState<'cpu' | 'gpu'>('gpu')
  const [bgStyle, setBgStyle] = useState<BgStyle>('transparent')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [downloadFormat, setDownloadFormat] = useState<ImageFormat>('png')
  const [downloadQuality, setDownloadQuality] = useState(0.92)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ key: string; current: number; total: number } | null>(null)
  const [cutout, setCutout] = useState<ImageData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRun = useCallback(async () => {
    setLoading(true)
    setError(null)
    setProgress(null)
    try {
      const result = await removeImageBackground(imageData, {
        model,
        device,
        format: 'image/png',
        onProgress: (p) => setProgress(p),
      })
      setCutout(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Background removal failed')
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }, [imageData, model, device])

  const composedResult = useMemo<ImageData | null>(() => {
    if (!cutout) return null
    if (bgStyle === 'color') return compositeOnColor(cutout, bgColor)
    return cutout
  }, [cutout, bgStyle, bgColor])

  const handleDownload = useCallback(async () => {
    if (!composedResult) return
    // Transparent + JPEG isn't representable; force PNG/WebP if the user picked
    // JPEG while keeping the alpha channel.
    let format: ImageFormat = downloadFormat
    if (bgStyle === 'transparent' && format === 'jpeg') {
      format = 'png'
    }
    const mime = formatToMime(format)
    const quality = format === 'png' ? undefined : downloadQuality
    const blob = await imageDataToBlob(composedResult, mime, quality)
    downloadBlob(blob, `no-background.${formatExtension(format)}`)
  }, [composedResult, downloadFormat, downloadQuality, bgStyle])

  const originalUrl = useMemo(() => imageDataToDataUrl(imageData, 'image/png'), [imageData])
  const resultUrl = useMemo(
    () => (composedResult ? imageDataToDataUrl(composedResult, 'image/png') : ''),
    [composedResult]
  )

  const progressPct =
    progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Background removal</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Runs an ONNX segmentation model directly in your browser via WebAssembly (and WebGPU when available). The model
            is downloaded once on first use and then cached. <strong>No images are uploaded.</strong>
          </p>

          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <div className="flex flex-wrap gap-2">
              {MODEL_OPTIONS.map((m) => (
                <Button
                  key={m.value}
                  variant={model === m.value ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setModel(m.value)}
                  title={m.description}
                >
                  {m.label}
                </Button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {MODEL_OPTIONS.find((m) => m.value === model)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hardware</label>
            <div className="flex gap-2">
              <Button
                variant={device === 'gpu' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setDevice('gpu')}
              >
                GPU (WebGPU)
              </Button>
              <Button
                variant={device === 'cpu' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setDevice('cpu')}
              >
                CPU (WASM)
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              GPU is faster on supported browsers (Chrome / Edge). If it fails, switch to CPU.
            </p>
          </div>

          <Button onClick={handleRun} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {progressPct !== null
                  ? `Loading model… ${progressPct}%`
                  : progress
                    ? `Working… (${progress.key})`
                    : 'Working…'}
              </>
            ) : (
              'Remove background'
            )}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {composedResult && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Result</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Background</label>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant={bgStyle === 'transparent' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setBgStyle('transparent')}
                >
                  Transparent
                </Button>
                <Button
                  variant={bgStyle === 'color' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setBgStyle('color')}
                >
                  Solid color
                </Button>
                {bgStyle === 'color' && (
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-9 w-14 rounded border border-input cursor-pointer"
                    aria-label="Background color"
                  />
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Preview ({composedResult.width}×{composedResult.height}).
              </p>
              <div
                className="rounded-lg border border-border overflow-hidden inline-block max-w-full"
                style={
                  bgStyle === 'transparent'
                    ? {
                        backgroundImage:
                          'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                      }
                    : { background: bgColor }
                }
              >
                <img
                  src={resultUrl}
                  alt="Background removed"
                  className="block max-h-[400px] w-auto h-auto object-contain"
                  style={{ maxWidth: '100%' }}
                  draggable={false}
                />
              </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Before / After comparison
              </summary>
              <div className="mt-2">
                <PreviewSlider
                  beforeUrl={originalUrl}
                  afterUrl={resultUrl}
                  beforeLabel="Original"
                  afterLabel="Cutout"
                  width={composedResult.width}
                  height={composedResult.height}
                />
              </div>
            </details>

            <div>
              <label className="block text-sm font-medium mb-2">Download</label>
              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value as ImageFormat)}
                  className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  <option value="png">PNG (transparent supported)</option>
                  <option value="webp">WebP (transparent supported)</option>
                  <option value="jpeg" disabled={bgStyle === 'transparent'}>
                    JPEG{bgStyle === 'transparent' ? ' (needs solid color)' : ''}
                  </option>
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
    </div>
  )
}
