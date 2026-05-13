'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Download, Loader2, Package } from 'lucide-react'
import {
  downloadBlob,
  formatExtension,
  formatToMime,
  imageDataToBlob,
  imageDataToDataUrl,
  type ImageFormat,
} from './shared'
import {
  SPLIT_PRESETS,
  splitImage,
  type SplitMode,
  type SplitResult,
} from '@/lib/smart-image-resizer/image-splitter'
import { buildZip, type ZipEntry } from '@/lib/smart-image-resizer/zip-writer'

interface SplitTabProps {
  imageData: ImageData
}

export function SplitTab({ imageData }: SplitTabProps) {
  const [splitMode, setSplitMode] = useState<SplitMode>('grid')
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [tileW, setTileW] = useState(1080)
  const [tileH, setTileH] = useState(1080)
  const [padEdges, setPadEdges] = useState(true)
  const [padColor, setPadColor] = useState('#ffffff')
  const [result, setResult] = useState<SplitResult | null>(null)
  const [downloadFormat, setDownloadFormat] = useState<ImageFormat>('png')
  const [downloadQuality, setDownloadQuality] = useState(0.92)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSplit = useCallback(() => {
    setLoading(true)
    setError(null)
    try {
      const next = splitImage(imageData, {
        mode: splitMode,
        rows,
        cols,
        tileWidth: tileW,
        tileHeight: tileH,
        padToTileSize: padEdges,
        padColor,
      })
      setResult(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Split failed')
    } finally {
      setLoading(false)
    }
  }, [imageData, splitMode, rows, cols, tileW, tileH, padEdges, padColor])

  const padToWidth = (n: number, width: number) => String(n).padStart(width, '0')

  const handleDownloadAll = useCallback(async () => {
    if (!result) return
    setLoading(true)
    setError(null)
    try {
      const mime = formatToMime(downloadFormat)
      const ext = formatExtension(downloadFormat)
      const quality = downloadFormat === 'png' ? undefined : downloadQuality
      const rowDigits = String(result.rows).length
      const colDigits = String(result.cols).length
      const entries: ZipEntry[] = []
      for (const tile of result.tiles) {
        const blob = await imageDataToBlob(tile.imageData, mime, quality)
        const buf = await blob.arrayBuffer()
        const name = `tile_r${padToWidth(tile.row + 1, rowDigits)}_c${padToWidth(tile.col + 1, colDigits)}.${ext}`
        entries.push({ name, data: new Uint8Array(buf) })
      }
      const zip = buildZip(entries)
      downloadBlob(zip, `image-split-${result.rows}x${result.cols}.zip`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to build zip')
    } finally {
      setLoading(false)
    }
  }, [result, downloadFormat, downloadQuality])

  const handleDownloadOne = useCallback(
    async (row: number, col: number, data: ImageData) => {
      const mime = formatToMime(downloadFormat)
      const ext = formatExtension(downloadFormat)
      const quality = downloadFormat === 'png' ? undefined : downloadQuality
      const blob = await imageDataToBlob(data, mime, quality)
      downloadBlob(blob, `tile_r${row + 1}_c${col + 1}.${ext}`)
    },
    [downloadFormat, downloadQuality]
  )

  // Preview overlay: faintly render the grid lines on top of the original image
  // so the user can see exactly how it will be cut.
  const overlay = useMemo(() => {
    const maxPreviewDim = 480
    const scale = Math.min(1, maxPreviewDim / Math.max(imageData.width, imageData.height))
    const dispW = Math.round(imageData.width * scale)
    const dispH = Math.round(imageData.height * scale)

    const lineX: number[] = []
    const lineY: number[] = []
    if (splitMode === 'grid') {
      const r = Math.max(1, rows)
      const c = Math.max(1, cols)
      for (let i = 1; i < c; i++) lineX.push((dispW * i) / c)
      for (let i = 1; i < r; i++) lineY.push((dispH * i) / r)
    } else {
      const tw = Math.max(1, tileW)
      const th = Math.max(1, tileH)
      const scaledTW = tw * scale
      const scaledTH = th * scale
      for (let x = scaledTW; x < dispW; x += scaledTW) lineX.push(x)
      for (let y = scaledTH; y < dispH; y += scaledTH) lineY.push(y)
    }

    return { dispW, dispH, lineX, lineY }
  }, [imageData.width, imageData.height, splitMode, rows, cols, tileW, tileH])

  const originalUrl = useMemo(() => imageDataToDataUrl(imageData, 'image/png'), [imageData])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Split settings</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mode</label>
            <div className="flex gap-2">
              <Button
                variant={splitMode === 'grid' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSplitMode('grid')}
              >
                Grid (rows × cols)
              </Button>
              <Button
                variant={splitMode === 'tile' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSplitMode('tile')}
              >
                Fixed tile size
              </Button>
            </div>
          </div>

          {splitMode === 'grid' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Layout presets</label>
                <div className="flex flex-wrap gap-2">
                  {SPLIT_PRESETS.map((p) => (
                    <Button
                      key={p.id}
                      variant={rows === p.rows && cols === p.cols ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setRows(p.rows)
                        setCols(p.cols)
                      }}
                      title={p.description}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Rows</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={rows}
                    onChange={(e) => setRows(Math.max(1, Number(e.target.value) || 1))}
                    className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm ml-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Columns</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={cols}
                    onChange={(e) => setCols(Math.max(1, Number(e.target.value) || 1))}
                    className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm ml-1"
                  />
                </div>
                <div className="text-sm text-muted-foreground self-end pb-1">
                  → {rows * cols} tiles, roughly {Math.floor(imageData.width / cols)}×{Math.floor(imageData.height / rows)} each
                </div>
              </div>
            </>
          )}

          {splitMode === 'tile' && (
            <>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Tile width</label>
                  <input
                    type="number"
                    min={1}
                    max={4096}
                    value={tileW}
                    onChange={(e) => setTileW(Math.max(1, Number(e.target.value) || 1))}
                    className="w-28 rounded-md border border-input bg-background px-2 py-1 text-sm ml-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tile height</label>
                  <input
                    type="number"
                    min={1}
                    max={4096}
                    value={tileH}
                    onChange={(e) => setTileH(Math.max(1, Number(e.target.value) || 1))}
                    className="w-28 rounded-md border border-input bg-background px-2 py-1 text-sm ml-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={padEdges}
                    onChange={(e) => setPadEdges(e.target.checked)}
                  />
                  Pad edge tiles to full tile size
                </label>
                {padEdges && (
                  <input
                    type="color"
                    value={padColor}
                    onChange={(e) => setPadColor(e.target.value)}
                    className="h-8 w-12 rounded border border-input cursor-pointer"
                    aria-label="Pad color"
                  />
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Preview</label>
            <div
              className="relative inline-block rounded-lg border border-border overflow-hidden bg-muted/30"
              style={{ width: overlay.dispW, height: overlay.dispH }}
            >
              <img
                src={originalUrl}
                alt="Split preview"
                width={overlay.dispW}
                height={overlay.dispH}
                className="block"
                draggable={false}
              />
              {overlay.lineX.map((x, i) => (
                <div
                  key={`vx-${i}`}
                  className="absolute top-0 bottom-0 bg-primary/80"
                  style={{ left: x - 0.5, width: 1 }}
                />
              ))}
              {overlay.lineY.map((y, i) => (
                <div
                  key={`hy-${i}`}
                  className="absolute left-0 right-0 bg-primary/80"
                  style={{ top: y - 0.5, height: 1 }}
                />
              ))}
            </div>
          </div>

          <Button onClick={handleSplit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Working...
              </>
            ) : (
              'Split image'
            )}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                Tiles ({result.rows} × {result.cols})
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value as ImageFormat)}
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
                <Button onClick={handleDownloadAll} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4 mr-2" />
                  )}
                  Download all (.zip)
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${result.cols}, minmax(0, 1fr))`,
              }}
            >
              {result.tiles.map((tile) => {
                const url = imageDataToDataUrl(tile.imageData, 'image/png')
                return (
                  <div
                    key={`${tile.row}-${tile.col}`}
                    className="group relative overflow-hidden rounded-md border border-border bg-muted/30"
                  >
                    <img
                      src={url}
                      alt={`Tile row ${tile.row + 1} col ${tile.col + 1}`}
                      className="block w-full h-auto"
                      draggable={false}
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-background/80 px-2 py-1 text-xs opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      <span className="text-muted-foreground">
                        R{tile.row + 1} · C{tile.col + 1} · {tile.imageData.width}×{tile.imageData.height}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadOne(tile.row, tile.col, tile.imageData)}
                        className="text-primary hover:underline"
                        aria-label={`Download tile row ${tile.row + 1} column ${tile.col + 1}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
