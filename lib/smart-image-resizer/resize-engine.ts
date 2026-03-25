/**
 * Resize engine: Smart (seam carve), Crop, Pad modes.
 * For large reductions, downscales first then seam carves to avoid distortion and speed up.
 */

import { carveSeamsAsync, type CarveProgress } from './seam-carver'

export type ResizeMode = 'smart' | 'crop' | 'pad'

export interface ResizeOptions {
  mode: ResizeMode
  targetWidth: number
  targetHeight: number
  mask?: Uint8Array | null
  padColor?: string
}

export interface ResizeResult {
  imageData: ImageData
  progress: number
  done: boolean
}

/** Max fraction of width/height to remove via seam carving (beyond that, scale first) */
const MAX_SEAM_REMOVAL_RATIO = 0.42

/** Max dimension before downscaling for performance (seam carving is O(W*H) per seam) */
const MAX_DIMENSION_FOR_CARVE = 1600

/**
 * Hard cap on total seam removals (vertical + horizontal). Wide/tall presets (e.g. Twitter,
 * LinkedIn) otherwise need far more seams than square Instagram; pre-scale to stay near this.
 */
const MAX_TOTAL_SEAMS = 520

/** Scale image down using canvas (high quality) */
function scaleDown(
  imageData: ImageData,
  newWidth: number,
  newHeight: number,
  mask?: Uint8Array | null
): { imageData: ImageData; mask: Uint8Array | null } {
  const canvas = document.createElement('canvas')
  canvas.width = newWidth
  canvas.height = newHeight
  const ctx = canvas.getContext('2d')!
  const srcCanvas = document.createElement('canvas')
  srcCanvas.width = imageData.width
  srcCanvas.height = imageData.height
  const srcCtx = srcCanvas.getContext('2d')!
  srcCtx.putImageData(imageData, 0, 0)
  ctx.drawImage(srcCanvas, 0, 0, imageData.width, imageData.height, 0, 0, newWidth, newHeight)
  const scaledData = ctx.getImageData(0, 0, newWidth, newHeight)

  let scaledMask: Uint8Array | null = null
  if (mask && mask.length === imageData.width * imageData.height) {
    scaledMask = new Uint8Array(newWidth * newHeight)
    const scaleX = imageData.width / newWidth
    const scaleY = imageData.height / newHeight
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const sx = Math.min(Math.floor(x * scaleX), imageData.width - 1)
        const sy = Math.min(Math.floor(y * scaleY), imageData.height - 1)
        scaledMask[y * newWidth + x] = mask[sy * imageData.width + sx]!
      }
    }
  }

  return { imageData: scaledData, mask: scaledMask }
}

export async function resizeImage(
  sourceImageData: ImageData,
  options: ResizeOptions,
  onProgress?: (p: CarveProgress) => void
): Promise<ImageData> {
  const { mode, targetWidth, targetHeight, mask, padColor = '#ffffff' } = options

  if (mode === 'smart') {
    if (targetWidth >= sourceImageData.width && targetHeight >= sourceImageData.height) {
      return padResize(sourceImageData, targetWidth, targetHeight, padColor)
    }

    let workImage = sourceImageData
    let workMask = mask ?? null

    if (
      workImage.width > MAX_DIMENSION_FOR_CARVE ||
      workImage.height > MAX_DIMENSION_FOR_CARVE
    ) {
      const scale = Math.min(
        MAX_DIMENSION_FOR_CARVE / workImage.width,
        MAX_DIMENSION_FOR_CARVE / workImage.height
      )
      const preW = Math.round(workImage.width * scale)
      const preH = Math.round(workImage.height * scale)
      const pre = scaleDown(workImage, preW, preH, workMask)
      workImage = pre.imageData
      workMask = pre.mask
    }

    const removeW = workImage.width - targetWidth
    const removeH = workImage.height - targetHeight
    const ratioW = removeW / workImage.width
    const ratioH = removeH / workImage.height

    if (ratioW > MAX_SEAM_REMOVAL_RATIO || ratioH > MAX_SEAM_REMOVAL_RATIO) {
      const minScaleW = removeW > 0 ? (targetWidth / (1 - MAX_SEAM_REMOVAL_RATIO)) / workImage.width : 1
      const minScaleH = removeH > 0 ? (targetHeight / (1 - MAX_SEAM_REMOVAL_RATIO)) / workImage.height : 1
      const scale = Math.min(minScaleW, minScaleH, 1)
      const intermediateW = Math.max(targetWidth, Math.ceil(workImage.width * scale))
      const intermediateH = Math.max(targetHeight, Math.ceil(workImage.height * scale))
      const scaled = scaleDown(workImage, intermediateW, intermediateH, workMask)
      workImage = scaled.imageData
      workMask = scaled.mask
    }

    {
      const rw = workImage.width - targetWidth
      const rh = workImage.height - targetHeight
      const totalSeams = Math.max(0, rw) + Math.max(0, rh)
      if (totalSeams > MAX_TOTAL_SEAMS) {
        const sCap =
          (MAX_TOTAL_SEAMS + targetWidth + targetHeight) /
          (workImage.width + workImage.height)
        const sMin = Math.max(
          targetWidth / workImage.width,
          targetHeight / workImage.height
        )
        const scale = Math.max(sMin, Math.min(1, sCap))
        if (scale < 1 - 1e-6) {
          const nw = Math.max(targetWidth, Math.round(workImage.width * scale))
          const nh = Math.max(targetHeight, Math.round(workImage.height * scale))
          const scaled = scaleDown(workImage, nw, nh, workMask)
          workImage = scaled.imageData
          workMask = scaled.mask
        }
      }
    }

    const carved = await carveSeamsAsync(workImage, targetWidth, targetHeight, workMask, onProgress)
    if (carved.width === targetWidth && carved.height === targetHeight) {
      return carved
    }
    return padResize(carved, targetWidth, targetHeight, padColor)
  }

  if (mode === 'crop') {
    return cropResize(sourceImageData, targetWidth, targetHeight)
  }

  if (mode === 'pad') {
    return padResize(sourceImageData, targetWidth, targetHeight, padColor)
  }

  return sourceImageData
}

function cropResize(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number
): ImageData {
  const { width, height, data } = imageData
  const cropW = Math.min(targetWidth, width)
  const cropH = Math.min(targetHeight, height)
  const startX = Math.floor((width - cropW) / 2)
  const startY = Math.floor((height - cropH) / 2)
  const offsetX = Math.floor((targetWidth - cropW) / 2)
  const offsetY = Math.floor((targetHeight - cropH) / 2)

  const newData = new Uint8ClampedArray(targetWidth * targetHeight * 4)
  for (let i = 0; i < targetWidth * targetHeight * 4; i += 4) {
    newData[i] = 0
    newData[i + 1] = 0
    newData[i + 2] = 0
    newData[i + 3] = 255
  }

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcIdx = ((startY + y) * width + (startX + x)) * 4
      const dstIdx = ((offsetY + y) * targetWidth + (offsetX + x)) * 4
      newData[dstIdx] = data[srcIdx]!
      newData[dstIdx + 1] = data[srcIdx + 1]!
      newData[dstIdx + 2] = data[srcIdx + 2]!
      newData[dstIdx + 3] = data[srcIdx + 3]!
    }
  }

  return new ImageData(newData, targetWidth, targetHeight)
}

function padResize(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
  padColor: string
): ImageData {
  const { width, height, data } = imageData
  const r = parseInt(padColor.slice(1, 3), 16)
  const g = parseInt(padColor.slice(3, 5), 16)
  const b = parseInt(padColor.slice(5, 7), 16)

  const offsetX = Math.floor((targetWidth - width) / 2)
  const offsetY = Math.floor((targetHeight - height) / 2)

  const newData = new Uint8ClampedArray(targetWidth * targetHeight * 4)
  for (let i = 0; i < targetWidth * targetHeight * 4; i += 4) {
    newData[i] = r
    newData[i + 1] = g
    newData[i + 2] = b
    newData[i + 3] = 255
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4
      const dstIdx = ((offsetY + y) * targetWidth + (offsetX + x)) * 4
      newData[dstIdx] = data[srcIdx]!
      newData[dstIdx + 1] = data[srcIdx + 1]!
      newData[dstIdx + 2] = data[srcIdx + 2]!
      newData[dstIdx + 3] = data[srcIdx + 3]!
    }
  }

  return new ImageData(newData, targetWidth, targetHeight)
}
