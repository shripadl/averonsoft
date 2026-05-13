/**
 * Minimal in-browser ZIP writer (STORE method, no compression).
 *
 * Produces a single Blob from a list of `{ name, data }` entries. PNG/JPEG/WebP
 * payloads are already compressed image streams, so re-compressing them with
 * DEFLATE would save almost nothing while adding a heavy dependency — STORE is
 * the right trade-off here.
 *
 * Spec reference: APPNOTE.TXT 6.3.4 (PKWARE ZIP File Format Specification).
 */

const CRC32_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ bytes[i]!) & 0xff]!
  }
  return (crc ^ 0xffffffff) >>> 0
}

export interface ZipEntry {
  name: string
  data: Uint8Array
}

interface CentralRecord {
  nameBytes: Uint8Array
  crc: number
  size: number
  offset: number
  dosTime: number
  dosDate: number
}

function dosDateTime(date: Date): { dosTime: number; dosDate: number } {
  const dosTime =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2)) & 0x1f)
  const dosDate =
    (((date.getFullYear() - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f)
  return { dosTime, dosDate }
}

/** Build a ZIP archive Blob containing the given entries (no compression). */
export function buildZip(entries: ZipEntry[], date: Date = new Date()): Blob {
  const { dosTime, dosDate } = dosDateTime(date)
  const encoder = new TextEncoder()
  const localParts: BlobPart[] = []
  const centralRecords: CentralRecord[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name)
    const crc = crc32(entry.data)
    const size = entry.data.length

    // Local file header (30 bytes + name)
    const header = new ArrayBuffer(30)
    const view = new DataView(header)
    view.setUint32(0, 0x04034b50, true) // signature
    view.setUint16(4, 20, true) // version needed
    view.setUint16(6, 0, true) // general purpose flag
    view.setUint16(8, 0, true) // compression method = STORE
    view.setUint16(10, dosTime, true)
    view.setUint16(12, dosDate, true)
    view.setUint32(14, crc, true)
    view.setUint32(18, size, true) // compressed size = uncompressed (STORE)
    view.setUint32(22, size, true) // uncompressed size
    view.setUint16(26, nameBytes.length, true)
    view.setUint16(28, 0, true) // extra field length

    localParts.push(header, nameBytes as BlobPart, entry.data as BlobPart)
    centralRecords.push({ nameBytes, crc, size, offset, dosTime, dosDate })

    offset += 30 + nameBytes.length + size
  }

  const centralStart = offset
  const centralParts: BlobPart[] = []
  let centralSize = 0
  for (const rec of centralRecords) {
    // Central directory file header (46 bytes + name)
    const buf = new ArrayBuffer(46)
    const v = new DataView(buf)
    v.setUint32(0, 0x02014b50, true) // signature
    v.setUint16(4, 20, true) // version made by
    v.setUint16(6, 20, true) // version needed
    v.setUint16(8, 0, true) // flag
    v.setUint16(10, 0, true) // method = STORE
    v.setUint16(12, rec.dosTime, true)
    v.setUint16(14, rec.dosDate, true)
    v.setUint32(16, rec.crc, true)
    v.setUint32(20, rec.size, true)
    v.setUint32(24, rec.size, true)
    v.setUint16(28, rec.nameBytes.length, true)
    v.setUint16(30, 0, true) // extra
    v.setUint16(32, 0, true) // comment
    v.setUint16(34, 0, true) // disk number
    v.setUint16(36, 0, true) // internal attrs
    v.setUint32(38, 0, true) // external attrs
    v.setUint32(42, rec.offset, true)

    centralParts.push(buf, rec.nameBytes as BlobPart)
    centralSize += 46 + rec.nameBytes.length
  }

  // End of central directory record (22 bytes, no comment)
  const eocd = new ArrayBuffer(22)
  const eview = new DataView(eocd)
  eview.setUint32(0, 0x06054b50, true)
  eview.setUint16(4, 0, true) // disk number
  eview.setUint16(6, 0, true) // central directory disk
  eview.setUint16(8, centralRecords.length, true)
  eview.setUint16(10, centralRecords.length, true)
  eview.setUint32(12, centralSize, true)
  eview.setUint32(16, centralStart, true)
  eview.setUint16(20, 0, true)

  return new Blob([...localParts, ...centralParts, eocd], { type: 'application/zip' })
}
