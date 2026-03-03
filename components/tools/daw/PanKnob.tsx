'use client'

import { useRef, useState, useCallback } from 'react'

interface PanKnobProps {
  value: number
  onChange: (value: number) => void
  size?: number
}

export function PanKnob({ value, onChange, size = 36 }: PanKnobProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const panToDeg = (pan: number) => -90 + pan * 90
  const deg = panToDeg(value)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      setIsDragging(true)
      const startY = e.clientY
      const startVal = value

      const onMove = (ev: PointerEvent) => {
        const dy = startY - ev.clientY
        const delta = dy / 100
        const newVal = Math.max(-1, Math.min(1, startVal + delta))
        onChange(newVal)
      }
      const onUp = () => {
        setIsDragging(false)
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
      }
      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
    },
    [value, onChange]
  )

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[9px] text-[rgb(var(--daw-text-muted))]">Pan</span>
      <div
        ref={ref}
        className="relative rounded-full bg-[rgb(var(--daw-bg-active))] border border-[rgb(var(--daw-border-strong))] cursor-ns-resize select-none"
        style={{ width: size, height: size }}
        onPointerDown={handlePointerDown}
      >
        <div
          className="absolute top-1/2 left-1/2 w-1 bg-[rgb(var(--daw-accent))] rounded-full origin-left"
          style={{
            transform: `translate(0, -50%) rotate(${deg}deg)`,
            height: 2,
            marginLeft: 2,
          }}
        />
      </div>
      <span className="text-[9px] font-mono text-[rgb(var(--daw-text-muted))]">
        {value === 0 ? 'C' : value > 0 ? `R${Math.round(value * 100)}` : `L${Math.round(-value * 100)}`}
      </span>
    </div>
  )
}
