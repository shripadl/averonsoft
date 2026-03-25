/**
 * Seam carving: find and remove lowest-energy seams.
 * Uses dynamic programming for optimal seam path.
 */

import { computeEnergyMap } from './energy-map'

export interface CarveProgress {
  progress: number
  total: number
  currentImageData: ImageData | null
  done: boolean
}

/**
 * Find the vertical seam (column indices per row) with minimum total energy.
 */
function findVerticalSeam(energy: Float32Array, width: number, height: number): number[] {
  const M = new Float32Array(width * height)
  const path = new Int32Array(width * height)

  for (let x = 0; x < width; x++) {
    M[x] = energy[x]!
  }

  for (let y = 1; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const e = energy[idx]!

      let minPrev = M[(y - 1) * width + x]!
      let minX = x

      if (x > 0) {
        const left = M[(y - 1) * width + (x - 1)]!
        if (left < minPrev) {
          minPrev = left
          minX = x - 1
        }
      }
      if (x < width - 1) {
        const right = M[(y - 1) * width + (x + 1)]!
        if (right < minPrev) {
          minPrev = right
          minX = x + 1
        }
      }

      M[idx] = e + minPrev
      path[idx] = minX
    }
  }

  const seam: number[] = []
  let minCol = 0
  let minVal = M[(height - 1) * width]!
  for (let x = 1; x < width; x++) {
    const v = M[(height - 1) * width + x]!
    if (v < minVal) {
      minVal = v
      minCol = x
    }
  }

  seam[height - 1] = minCol
  for (let y = height - 2; y >= 0; y--) {
    minCol = path[(y + 1) * width + minCol]!
    seam[y] = minCol
  }

  return seam
}

/**
 * Remove a vertical seam from image data.
 */
function removeVerticalSeam(
  imageData: ImageData,
  seam: number[]
): ImageData {
  const { width, height, data } = imageData
  const newWidth = width - 1
  const newData = new Uint8ClampedArray(newWidth * height * 4)

  for (let y = 0; y < height; y++) {
    const skipCol = seam[y]!
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4
      const dstCol = x < skipCol ? x : x - 1
      if (x !== skipCol) {
        const dstIdx = (y * newWidth + dstCol) * 4
        newData[dstIdx] = data[srcIdx]!
        newData[dstIdx + 1] = data[srcIdx + 1]!
        newData[dstIdx + 2] = data[srcIdx + 2]!
        newData[dstIdx + 3] = data[srcIdx + 3]!
      }
    }
  }

  return new ImageData(newData, newWidth, height)
}

/**
 * Remove a horizontal seam. Transpose, remove vertical, transpose back.
 */
function removeHorizontalSeam(
  imageData: ImageData,
  seam: number[]
): ImageData {
  const transposed = transposeImage(imageData)
  const seamCols = seam
  const newTransposed = removeVerticalSeam(transposed, seamCols)
  return transposeImage(newTransposed)
}

function transposeImage(imageData: ImageData): ImageData {
  const { width, height, data } = imageData
  const newData = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4
      const dstIdx = (x * height + y) * 4
      newData[dstIdx] = data[srcIdx]!
      newData[dstIdx + 1] = data[srcIdx + 1]!
      newData[dstIdx + 2] = data[srcIdx + 2]!
      newData[dstIdx + 3] = data[srcIdx + 3]!
    }
  }
  return new ImageData(newData, height, width)
}

/**
 * Find horizontal seam (row indices per column).
 */
function findHorizontalSeam(energy: Float32Array, width: number, height: number): number[] {
  const transposedEnergy = new Float32Array(height * width)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      transposedEnergy[x * height + y] = energy[y * width + x]!
    }
  }
  return findVerticalSeam(transposedEnergy, height, width)
}

const SEAMS_PER_CHUNK = 22

function processChunk(
  cb: () => boolean
): Promise<void> {
  return new Promise((resolve) => {
    const run = () => {
      const done = cb()
      if (done) resolve()
      else requestAnimationFrame(run)
    }
    requestAnimationFrame(run)
  })
}

export async function carveSeamsAsync(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
  mask: Uint8Array | null,
  onProgress?: (p: CarveProgress) => void
): Promise<ImageData> {
  let current = imageData
  let currentMask = mask
  const totalToRemoveW = Math.max(0, imageData.width - targetWidth)
  const totalToRemoveH = Math.max(0, imageData.height - targetHeight)
  const totalSteps = totalToRemoveW + totalToRemoveH
  let stepsDone = 0

  const report = () => {
    if (onProgress) {
      onProgress({
        progress: stepsDone,
        total: totalSteps,
        currentImageData: current,
        done: stepsDone >= totalSteps,
      })
    }
  }

  let wIdx = 0
  let hIdx = 0

  while (wIdx < totalToRemoveW || hIdx < totalToRemoveH) {
    await processChunk(() => {
      let chunk = 0
      while (chunk < SEAMS_PER_CHUNK && wIdx < totalToRemoveW) {
        const energy = computeEnergyMap(current, currentMask)
        const seam = findVerticalSeam(energy, current.width, current.height)
        current = removeVerticalSeam(current, seam)
        if (currentMask) {
          const oldW = current.width + 1
          const newMask = new Uint8Array(current.width * current.height)
          for (let y = 0; y < current.height; y++) {
            const skipCol = seam[y]!
            for (let newX = 0; newX < current.width; newX++) {
              const oldX = newX < skipCol ? newX : newX + 1
              newMask[y * current.width + newX] = currentMask[y * oldW + oldX]!
            }
          }
          currentMask = newMask
        }
        wIdx++
        stepsDone++
        chunk++
        report()
      }
      while (chunk < SEAMS_PER_CHUNK && hIdx < totalToRemoveH) {
        const energy = computeEnergyMap(current, currentMask)
        const seam = findHorizontalSeam(energy, current.width, current.height)
        current = removeHorizontalSeam(current, seam)
        if (currentMask) {
          const oldH = current.height + 1
          const newMask = new Uint8Array(current.width * current.height)
          for (let x = 0; x < current.width; x++) {
            const skipRow = seam[x]!
            for (let newY = 0; newY < current.height; newY++) {
              const oldY = newY < skipRow ? newY : newY + 1
              newMask[newY * current.width + x] = currentMask[oldY * current.width + x]!
            }
          }
          currentMask = newMask
        }
        hIdx++
        stepsDone++
        chunk++
        report()
      }
      return wIdx >= totalToRemoveW && hIdx >= totalToRemoveH
    })
  }

  return current
}

export function carveSeams(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
  mask: Uint8Array | null,
  onProgress?: (p: CarveProgress) => void
): ImageData {
  let current = imageData
  const totalToRemoveW = imageData.width - targetWidth
  const totalToRemoveH = imageData.height - targetHeight
  const totalSteps = Math.max(0, totalToRemoveW) + Math.max(0, totalToRemoveH)
  let stepsDone = 0

  const report = () => {
    if (onProgress) {
      onProgress({
        progress: stepsDone,
        total: totalSteps,
        currentImageData: current,
        done: stepsDone >= totalSteps,
      })
    }
  }

  for (let i = 0; i < totalToRemoveW; i++) {
    const energy = computeEnergyMap(current, mask)
    const seam = findVerticalSeam(energy, current.width, current.height)
    current = removeVerticalSeam(current, seam)
    if (mask) {
      const oldW = current.width + 1
      const newMask = new Uint8Array(current.width * current.height)
      for (let y = 0; y < current.height; y++) {
        const skipCol = seam[y]!
        for (let newX = 0; newX < current.width; newX++) {
          const oldX = newX < skipCol ? newX : newX + 1
          newMask[y * current.width + newX] = mask[y * oldW + oldX]!
        }
      }
      mask = newMask
    }
    stepsDone++
    report()
  }

  for (let i = 0; i < totalToRemoveH; i++) {
    const energy = computeEnergyMap(current, mask)
    const seam = findHorizontalSeam(energy, current.width, current.height)
    current = removeHorizontalSeam(current, seam)
    if (mask) {
      const oldH = current.height + 1
      const newMask = new Uint8Array(current.width * current.height)
      for (let x = 0; x < current.width; x++) {
        const skipRow = seam[x]!
        for (let newY = 0; newY < current.height; newY++) {
          const oldY = newY < skipRow ? newY : newY + 1
          newMask[newY * current.width + x] = mask[oldY * current.width + x]!
        }
      }
      mask = newMask
    }
    stepsDone++
    report()
  }

  return current
}
