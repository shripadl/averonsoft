'use client'

interface ArrangementGridProps {
  duration: number
  bpm: number
  pixelsPerSecond: number
  height: number
}

export function ArrangementGrid({ duration, bpm, pixelsPerSecond, height }: ArrangementGridProps) {
  const beatsPerBar = 4
  const secondsPerBeat = 60 / bpm
  const secondsPerBar = secondsPerBeat * beatsPerBar
  const bars = Math.ceil(duration / secondsPerBar) || 16
  const totalWidth = Math.max(duration * pixelsPerSecond, 800)

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ width: totalWidth }}
    >
      {/* Bar lines */}
      {Array.from({ length: bars + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-[rgb(var(--daw-border)/0.6)]"
          style={{ left: i * secondsPerBar * pixelsPerSecond }}
        />
      ))}
      {/* Beat lines (lighter) */}
      {Array.from({ length: bars * beatsPerBar + 1 }).map((_, i) => (
        <div
          key={`b-${i}`}
          className="absolute top-0 bottom-0 w-px bg-[rgb(var(--daw-border)/0.3)]"
          style={{ left: (i * secondsPerBeat * pixelsPerSecond) }}
        />
      ))}
    </div>
  )
}
