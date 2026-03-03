/**
 * DAW audio utilities: waveform extraction, WAV export
 */

export function getWaveformData(
  audioBuffer: AudioBuffer,
  width: number,
  channel = 0
): Float32Array {
  const data = audioBuffer.getChannelData(channel)
  const blockSize = Math.floor(data.length / width)
  const result = new Float32Array(width)

  for (let i = 0; i < width; i++) {
    const start = i * blockSize
    let sum = 0
    let max = 0
    for (let j = 0; j < blockSize && start + j < data.length; j++) {
      const v = Math.abs(data[start + j])
      sum += v
      if (v > max) max = v
    }
    result[i] = blockSize > 0 ? max : 0
  }
  return result
}

export function exportToWav(
  audioBuffer: AudioBuffer,
  sampleRate: number
): Blob {
  const numChannels = audioBuffer.numberOfChannels
  const length = audioBuffer.length * numChannels * 2
  const buffer = new ArrayBuffer(44 + length)
  const view = new DataView(buffer)
  const channels: Float32Array[] = []
  for (let i = 0; i < numChannels; i++) {
    channels.push(audioBuffer.getChannelData(i))
  }

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true)
  view.setUint16(32, numChannels * 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, length, true)

  let offset = 44
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]))
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
      view.setInt16(offset, intSample, true)
      offset += 2
    }
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Extract a portion of an AudioBuffer (non-destructive - creates new buffer) */
export function sliceBuffer(
  ctx: AudioContext,
  buffer: AudioBuffer,
  startSample: number,
  endSample: number
): AudioBuffer {
  const length = Math.min(endSample - startSample, buffer.length - startSample)
  const newBuffer = ctx.createBuffer(
    buffer.numberOfChannels,
    length,
    buffer.sampleRate
  )
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch)
    const dst = newBuffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      dst[i] = src[startSample + i] ?? 0
    }
  }
  return newBuffer
}

/** Merge two buffers (paste) - creates new buffer */
export function concatBuffers(
  ctx: AudioContext,
  buffers: AudioBuffer[],
  sampleRate: number
): AudioBuffer {
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0)
  const numChannels = buffers[0]?.numberOfChannels ?? 1
  const result = ctx.createBuffer(numChannels, totalLength, sampleRate)
  let offset = 0
  for (const buf of buffers) {
    for (let ch = 0; ch < Math.min(numChannels, buf.numberOfChannels); ch++) {
      const src = buf.getChannelData(ch)
      const dst = result.getChannelData(ch)
      for (let i = 0; i < buf.length; i++) {
        dst[offset + i] = src[i]
      }
    }
    offset += buf.length
  }
  return result
}
