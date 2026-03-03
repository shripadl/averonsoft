'use client'

interface MixerFaderProps {
  value: number
  onChange: (value: number) => void
  peak?: number
  rms?: number
  label?: string
}

export function MixerFader({ value, onChange, peak = 0, rms = 0, label }: MixerFaderProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-[9px] text-[rgb(var(--daw-text-muted))]">{label}</span>}
      <div className="flex items-center gap-2 h-28">
        {/* Peak/RMS meter */}
        <div className="w-2 h-full rounded-full bg-[rgb(var(--daw-bg))] overflow-hidden flex flex-col-reverse">
          <div
            className="w-full bg-[rgb(var(--daw-play))] transition-all duration-75 min-h-[2px]"
            style={{ height: `${Math.min(100, (rms || 0) * 100)}%` }}
          />
          <div
            className="w-full bg-[rgb(var(--daw-record))] opacity-90 transition-all duration-75 min-h-[2px]"
            style={{ height: `${Math.min(100, (peak || 0) * 100)}%` }}
          />
        </div>
        {/* Vertical fader - rotated horizontal range */}
        <div className="relative w-6 h-24 overflow-hidden">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute w-24 h-6 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 accent-[rgb(var(--daw-accent))]"
            style={{ transform: 'translate(-50%, -50%) rotate(-90deg)' }}
          />
        </div>
      </div>
      <span className="text-[9px] font-mono text-[rgb(var(--daw-text-muted))]">{Math.round(value * 100)}</span>
    </div>
  )
}
