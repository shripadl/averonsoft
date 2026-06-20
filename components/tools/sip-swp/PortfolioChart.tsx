'use client'

import { useEffect, useRef } from 'react'
import type { YearlyRow } from '@/lib/sip-swp/calculator'

interface PortfolioChartProps {
  data: YearlyRow[]
  taxOn: boolean
}

export function PortfolioChart({ data, taxOn }: PortfolioChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap || data.length === 0) return

    const draw = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const rect = wrap.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.scale(dpr, dpr)

      const W = rect.width
      const H = rect.height
      ctx.clearRect(0, 0, W, H)

      const pad = { l: 52, r: 16, t: 16, b: 32 }
      const pw = W - pad.l - pad.r
      const ph = H - pad.t - pad.b
      const n = data.length
      if (!n) return

      const maxVal = Math.max(...data.map((d) => d.principal + d.growth))
      if (!maxVal) return

      const gridColor =
        getComputedStyle(document.documentElement).getPropertyValue('--border').trim() ||
        '#2a3147'
      const mutedColor =
        getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim() ||
        '#4a5568'

      ctx.strokeStyle = gridColor || '#2a3147'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 5])
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + ph * (1 - i / 4)
        ctx.beginPath()
        ctx.moveTo(pad.l, y)
        ctx.lineTo(W - pad.r, y)
        ctx.stroke()
        const v = maxVal * (i / 4)
        ctx.fillStyle = mutedColor || '#4a5568'
        ctx.font = '9px ui-monospace, monospace'
        ctx.textAlign = 'right'
        const label =
          v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)
        ctx.fillText(label, pad.l - 4, y + 3)
      }
      ctx.setLineDash([])

      const gap = Math.max(1, Math.floor(pw * 0.015))
      const bw = Math.max(2, Math.floor((pw - gap * (n - 1)) / n))

      data.forEach((d, i) => {
        const x = pad.l + i * (bw + gap)
        const pH = (d.principal / maxVal) * ph
        const gH = (d.growth / maxVal) * ph
        const tH = (d.tax / maxVal) * ph

        ctx.fillStyle = '#3b82f6'
        ctx.fillRect(x, pad.t + ph - pH, bw, pH)
        ctx.fillStyle = '#22c55e'
        ctx.fillRect(x, pad.t + ph - pH - gH, bw, gH)
        if (taxOn && d.tax > 0) {
          ctx.fillStyle = 'rgba(239,68,68,0.75)'
          ctx.fillRect(x, pad.t + ph - pH - gH, bw, tH)
        }

        if (n <= 15 || i % Math.ceil(n / 10) === 0) {
          ctx.fillStyle = mutedColor || '#4a5568'
          ctx.font = '8px ui-monospace, monospace'
          ctx.textAlign = 'center'
          ctx.fillText(`Y${i + 1}`, x + bw / 2, H - pad.b + 14)
        }
      })
    }

    draw()
    const ro = new ResizeObserver(() => draw())
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [data, taxOn])

  return (
    <div ref={wrapRef} className="relative min-h-[220px] flex-1">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
    </div>
  )
}
