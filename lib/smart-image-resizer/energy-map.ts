/**
 * Energy map computation for seam carving.
 * Uses gradient magnitude (forward differences) to identify "interesting" pixels.
 * Protected mask pixels get maximum energy so they are never removed.
 */

const PROTECTED_ENERGY = 1e9

export function computeEnergyMap(
  imageData: ImageData,
  mask?: Uint8Array | null
): Float32Array {
  const { width, height, data } = imageData
  const energy = new Float32Array(width * height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4

      if (mask && mask[y * width + x] > 0) {
        energy[y * width + x] = PROTECTED_ENERGY
        continue
      }

      const left = x > 0 ? (y * width + (x - 1)) * 4 : i
      const right = x < width - 1 ? (y * width + (x + 1)) * 4 : i
      const top = y > 0 ? ((y - 1) * width + x) * 4 : i
      const bottom = y < height - 1 ? ((y + 1) * width + x) * 4 : i

      const dxR = Math.abs(data[right]! - data[left]!)
      const dxG = Math.abs(data[right + 1]! - data[left + 1]!)
      const dxB = Math.abs(data[right + 2]! - data[left + 2]!)

      const dyR = Math.abs(data[bottom]! - data[top]!)
      const dyG = Math.abs(data[bottom + 1]! - data[top + 1]!)
      const dyB = Math.abs(data[bottom + 2]! - data[top + 2]!)

      const gradient = dxR + dxG + dxB + dyR + dyG + dyB
      energy[y * width + x] = gradient
    }
  }

  return energy
}
