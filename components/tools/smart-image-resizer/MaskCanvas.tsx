'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

export interface MaskCanvasProps {
  width: number
  height: number
  displayWidth: number
  displayHeight: number
  mask: Uint8Array | null
  onMaskChange: (mask: Uint8Array) => void
  brushSize: number
  eraseMode: boolean
  disabled?: boolean
}

export function MaskCanvas({
  width,
  height,
  displayWidth,
  displayHeight,
  mask,
  onMaskChange,
  brushSize,
  eraseMode,
  disabled,
}: MaskCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const maskRef = useRef<Uint8Array | null>(null)

  useEffect(() => {
    maskRef.current = mask ?? maskRef.current
    if (!mask) maskRef.current = null
  }, [mask])

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const scaleX = width / rect.width
      const scaleY = height / rect.height
      const x = Math.floor((e.clientX - rect.left) * scaleX)
      const y = Math.floor((e.clientY - rect.top) * scaleY)
      return { x, y }
    },
    [width, height]
  )

  const drawAt = useCallback(
    (x: number, y: number) => {
      if (width <= 0 || height <= 0) return
      if (!maskRef.current) {
        maskRef.current = new Uint8Array(width * height)
      }
      const m = new Uint8Array(maskRef.current)
      const r = Math.ceil(brushSize / 2)
      const value = eraseMode ? 0 : 255
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy <= r * r) {
            const px = x + dx
            const py = y + dy
            if (px >= 0 && px < width && py >= 0 && py < height) {
              m[py * width + px] = value
            }
          }
        }
      }
      maskRef.current = m
      onMaskChange(m)
    },
    [width, height, brushSize, eraseMode, onMaskChange]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return
      e.preventDefault()
      setIsDrawing(true)
      const coords = getCanvasCoords(e)
      if (coords) drawAt(coords.x, coords.y)
    },
    [disabled, getCanvasCoords, drawAt]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || disabled) return
      const coords = getCanvasCoords(e)
      if (coords) drawAt(coords.x, coords.y)
    },
    [isDrawing, disabled, getCanvasCoords, drawAt]
  )

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDrawing(false)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width <= 0 || height <= 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    const m = mask ?? maskRef.current
    if (m) {
      const imgData = ctx.createImageData(width, height)
      for (let i = 0; i < m.length; i++) {
        if (m[i]) {
          imgData.data[i * 4] = 255
          imgData.data[i * 4 + 1] = 0
          imgData.data[i * 4 + 2] = 0
          imgData.data[i * 4 + 3] = 80
        }
      }
      ctx.putImageData(imgData, 0, 0)
    }
  }, [mask, width, height])

  if (width <= 0 || height <= 0) return null

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: displayWidth,
        height: displayHeight,
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: disabled ? 'not-allowed' : eraseMode ? 'cell' : 'crosshair',
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      aria-label="Draw mask to protect areas from removal"
    />
  )
}
