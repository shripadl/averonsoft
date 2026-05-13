/**
 * Image splitter: divide an ImageData into a grid of tiles.
 *
 * Supports either an even rows x cols split, or splitting into tiles of an
 * exact target size (the bottom/right edge may keep a smaller remainder unless
 * `padToTileSize` is used, in which case remainders are padded with `padColor`).
 */

export type SplitMode = 'grid' | 'tile'

export interface SplitOptions {
  mode: SplitMode
  /** For `grid` mode: number of rows. Ignored in `tile` mode. */
  rows?: number
  /** For `grid` mode: number of columns. Ignored in `tile` mode. */
  cols?: number
  /** For `tile` mode: width of each tile in pixels. */
  tileWidth?: number
  /** For `tile` mode: height of each tile in pixels. */
  tileHeight?: number
  /** For `tile` mode: pad edge tiles to `tileWidth` × `tileHeight`. */
  padToTileSize?: boolean
  /** Hex color used when padding edge tiles. Defaults to `#ffffff`. */
  padColor?: string
}

export interface SplitTile {
  /** Zero-based row index in the resulting grid. */
  row: number
  /** Zero-based column index in the resulting grid. */
  col: number
  /** Tile pixel data. */
  imageData: ImageData
}

export interface SplitResult {
  rows: number
  cols: number
  tiles: SplitTile[]
}

function parseHex(color: string): { r: number; g: number; b: number } {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return { r, g, b }
}

function extractTile(
  source: ImageData,
  startX: number,
  startY: number,
  tileW: number,
  tileH: number,
  padColor?: { r: number; g: number; b: number }
): ImageData {
  const { width, data } = source
  const out = new Uint8ClampedArray(tileW * tileH * 4)
  if (padColor) {
    for (let i = 0; i < out.length; i += 4) {
      out[i] = padColor.r
      out[i + 1] = padColor.g
      out[i + 2] = padColor.b
      out[i + 3] = 255
    }
  }

  const maxX = Math.min(startX + tileW, source.width)
  const maxY = Math.min(startY + tileH, source.height)
  for (let y = startY; y < maxY; y++) {
    for (let x = startX; x < maxX; x++) {
      const srcIdx = (y * width + x) * 4
      const dstIdx = ((y - startY) * tileW + (x - startX)) * 4
      out[dstIdx] = data[srcIdx]!
      out[dstIdx + 1] = data[srcIdx + 1]!
      out[dstIdx + 2] = data[srcIdx + 2]!
      out[dstIdx + 3] = data[srcIdx + 3]!
    }
  }
  return new ImageData(out, tileW, tileH)
}

export function splitImage(source: ImageData, options: SplitOptions): SplitResult {
  const { mode } = options
  const pad = options.padToTileSize ? parseHex(options.padColor ?? '#ffffff') : undefined

  if (mode === 'grid') {
    const rows = Math.max(1, Math.floor(options.rows ?? 1))
    const cols = Math.max(1, Math.floor(options.cols ?? 1))
    // Distribute pixels as evenly as possible; earlier tiles absorb the +1 remainder.
    const baseW = Math.floor(source.width / cols)
    const remW = source.width % cols
    const baseH = Math.floor(source.height / rows)
    const remH = source.height % rows

    const tiles: SplitTile[] = []
    let y = 0
    for (let r = 0; r < rows; r++) {
      const h = baseH + (r < remH ? 1 : 0)
      let x = 0
      for (let c = 0; c < cols; c++) {
        const w = baseW + (c < remW ? 1 : 0)
        tiles.push({ row: r, col: c, imageData: extractTile(source, x, y, w, h) })
        x += w
      }
      y += h
    }
    return { rows, cols, tiles }
  }

  // tile mode
  const tileW = Math.max(1, Math.floor(options.tileWidth ?? source.width))
  const tileH = Math.max(1, Math.floor(options.tileHeight ?? source.height))
  const cols = Math.max(1, Math.ceil(source.width / tileW))
  const rows = Math.max(1, Math.ceil(source.height / tileH))

  const tiles: SplitTile[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const startX = c * tileW
      const startY = r * tileH
      const remainW = Math.min(tileW, source.width - startX)
      const remainH = Math.min(tileH, source.height - startY)
      if (options.padToTileSize) {
        tiles.push({
          row: r,
          col: c,
          imageData: extractTile(source, startX, startY, tileW, tileH, pad),
        })
      } else {
        tiles.push({
          row: r,
          col: c,
          imageData: extractTile(source, startX, startY, remainW, remainH),
        })
      }
    }
  }
  return { rows, cols, tiles }
}

/** Convenience presets for common splitting layouts. */
export interface SplitPreset {
  id: string
  label: string
  rows: number
  cols: number
  description: string
}

export const SPLIT_PRESETS: SplitPreset[] = [
  { id: 'ig3x1', label: 'Instagram carousel (3×1)', rows: 1, cols: 3, description: 'Three horizontal panels for a swipeable carousel.' },
  { id: 'ig3x3', label: 'Instagram 3×3 grid', rows: 3, cols: 3, description: 'Nine-tile feed grid (post each tile in order).' },
  { id: 'ig2x3', label: 'Instagram 2×3 grid', rows: 2, cols: 3, description: 'Six-tile feed grid.' },
  { id: 'half_h', label: 'Halves (left / right)', rows: 1, cols: 2, description: 'Split into two side-by-side halves.' },
  { id: 'half_v', label: 'Halves (top / bottom)', rows: 2, cols: 1, description: 'Split into top and bottom halves.' },
  { id: 'quarters', label: 'Quarters (2×2)', rows: 2, cols: 2, description: 'Four equal quadrants.' },
]
