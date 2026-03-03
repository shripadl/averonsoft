'use client'

import { useEffect, useRef } from 'react'

interface WaveformCanvasProps {
  waveform: Float32Array
  width: number
  height: number
  color?: string
  progress?: number
}

export function WaveformCanvas({
  waveform,
  width,
  height,
  color = 'rgba(99, 102, 241, 0.85)',
  progress = 0,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || waveform.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)
    const midY = height / 2
    const maxAmp = Math.max(...Array.from(waveform), 0.001)

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, midY)

    for (let i = 0; i < waveform.length; i++) {
      const x = (i / waveform.length) * width
      const amp = (waveform[i] / maxAmp) * (midY - 4)
      ctx.lineTo(x, midY - amp)
    }
    for (let i = waveform.length - 1; i >= 0; i--) {
      const x = (i / waveform.length) * width
      const amp = (waveform[i] / maxAmp) * (midY - 4)
      ctx.lineTo(x, midY + amp)
    }
    ctx.closePath()
    ctx.fill()

    if (progress > 0 && progress < 1) {
      ctx.fillStyle = 'rgba(99, 102, 241, 0.25)'
      ctx.fillRect(0, 0, width * progress, height)
    }
  }, [waveform, width, height, color, progress])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="block w-full h-full"
    />
  )
}
