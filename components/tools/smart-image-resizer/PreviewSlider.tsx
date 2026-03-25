'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface PreviewSliderProps {
  beforeUrl: string
  afterUrl: string
  beforeLabel?: string
  afterLabel?: string
  width: number
  height: number
}

export function PreviewSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Before',
  afterLabel = 'After',
  width,
  height,
}: PreviewSliderProps) {
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.max(0, Math.min(100, x)))
  }, [])

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) updatePosition(e.clientX)
    },
    [dragging, updatePosition]
  )

  const handleDown = useCallback(() => setDragging(true), [])
  const handleUp = useCallback(() => setDragging(false), [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0]!.clientX)
    },
    [updatePosition]
  )

  useEffect(() => {
    if (!dragging) return
    const onUp = () => setDragging(false)
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [dragging])

  const maxDim = 500
  const scale = Math.min(1, maxDim / Math.max(width, height))
  const displayW = Math.round(width * scale)
  const displayH = Math.round(height * scale)
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{beforeLabel}</span>
        <span>{afterLabel}</span>
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-border bg-muted/30 select-none"
        style={{ width: displayW, height: displayH, maxWidth: '100%' }}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onTouchMove={handleTouchMove}
      >
        <img
          src={beforeUrl}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ objectPosition: 'left' }}
          draggable={false}
        />
        <div
          className="absolute inset-0 bg-no-repeat bg-contain bg-left"
          style={{
            backgroundImage: `url(${afterUrl})`,
            backgroundSize: 'contain',
            clipPath: `inset(0 ${100 - position}% 0 0)`,
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-8 rounded bg-primary flex items-center justify-center">
            <div className="w-0.5 h-4 bg-primary-foreground rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
