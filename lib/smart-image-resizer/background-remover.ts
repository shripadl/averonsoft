/**
 * Background remover: wraps `@imgly/background-removal` (client-side ONNX/WASM).
 *
 * The underlying library streams ~30–80 MB of model + WASM weights from a CDN
 * on first use, then caches them in the browser. Nothing is uploaded — all
 * inference runs locally on the user's device. We dynamic-import the package
 * so it never enters the server bundle and is only fetched when the user opens
 * the Background Removal tab.
 */

export type BackgroundRemovalModel = 'isnet' | 'isnet_fp16' | 'isnet_quint8'

export interface BackgroundRemovalProgress {
  /** Identifier of the asset currently downloading (model, wasm, etc.). */
  key: string
  /** Bytes received so far for this asset. */
  current: number
  /** Total bytes expected for this asset (0 if unknown). */
  total: number
}

export interface BackgroundRemovalOptions {
  /** Smaller models are faster but lower-quality. Defaults to `isnet_fp16`. */
  model?: BackgroundRemovalModel
  /** Use GPU (WebGPU) when available, otherwise CPU/WASM. */
  device?: 'cpu' | 'gpu'
  /** Output image format. PNG preserves transparency. */
  format?: 'image/png' | 'image/webp'
  /** Quality for lossy formats (0–1). */
  quality?: number
  /** Streaming download progress callback. */
  onProgress?: (p: BackgroundRemovalProgress) => void
}

function imageDataToBlob(imageData: ImageData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.putImageData(imageData, 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode source image'))),
      'image/png'
    )
  })
}

async function blobToImageData(blob: Blob): Promise<ImageData> {
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to decode result image'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    ctx.drawImage(img, 0, 0)
    return ctx.getImageData(0, 0, canvas.width, canvas.height)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Remove the background from an ImageData. Returns a new ImageData with an
 * alpha channel where the background pixels are transparent.
 */
export async function removeImageBackground(
  source: ImageData,
  options: BackgroundRemovalOptions = {}
): Promise<ImageData> {
  if (typeof window === 'undefined') {
    throw new Error('Background removal can only run in a browser environment')
  }

  // Dynamic import keeps the ~50KB JS wrapper + ONNX runtime out of the
  // server bundle and the initial client chunk.
  const mod = await import('@imgly/background-removal')
  const removeBackground = mod.removeBackground

  const input = await imageDataToBlob(source)
  const config: Record<string, unknown> = {
    model: options.model ?? 'isnet_fp16',
    device: options.device ?? 'gpu',
    output: {
      format: options.format ?? 'image/png',
      quality: options.quality ?? 0.92,
    },
  }
  if (options.onProgress) {
    const cb = options.onProgress
    config.progress = (key: string, current: number, total: number) => {
      cb({ key, current, total })
    }
  }

  const outBlob = await removeBackground(input, config)
  return blobToImageData(outBlob)
}

/**
 * Composite an image with a transparent background onto a solid color
 * background. Useful for producing JPEG output (which lacks transparency)
 * after background removal.
 */
export function compositeOnColor(source: ImageData, hexColor: string): ImageData {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)

  const { width, height, data } = source
  const out = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]! / 255
    out[i] = Math.round(data[i]! * a + r * (1 - a))
    out[i + 1] = Math.round(data[i + 1]! * a + g * (1 - a))
    out[i + 2] = Math.round(data[i + 2]! * a + b * (1 - a))
    out[i + 3] = 255
  }
  return new ImageData(out, width, height)
}
