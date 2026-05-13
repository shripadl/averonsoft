/**
 * Shared client-side helpers used by every tab of the Smart Image Resizer tool.
 *
 * Everything in here runs in the browser only — these utilities depend on
 * `HTMLCanvasElement`, `ImageData`, and `Blob`.
 */

export type ImageFormat = 'png' | 'jpeg' | 'webp'

export function formatToMime(format: ImageFormat): 'image/png' | 'image/jpeg' | 'image/webp' {
  if (format === 'jpeg') return 'image/jpeg'
  if (format === 'webp') return 'image/webp'
  return 'image/png'
}

export function formatExtension(format: ImageFormat): string {
  return format === 'jpeg' ? 'jpg' : format
}

/** Render an ImageData to a data URL in the given format. */
export function imageDataToDataUrl(
  imageData: ImageData,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality?: number
): string {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.putImageData(imageData, 0, 0)
  if (format !== 'image/png' && quality !== undefined) {
    return canvas.toDataURL(format, quality)
  }
  return canvas.toDataURL(format)
}

/** Render an ImageData to a Blob in the given format. */
export function imageDataToBlob(
  imageData: ImageData,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality?: number
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas 2D context unavailable'))
  ctx.putImageData(imageData, 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Encoding failed'))),
      format,
      format === 'image/png' ? undefined : quality
    )
  })
}

/** Decode a File into an ImageData using a temporary canvas. */
export async function fileToImageData(file: File): Promise<ImageData> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image'))
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

/** Trigger a browser download for a Blob with the given filename. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp'
export const MAX_SIZE_MB = 10
