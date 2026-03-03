'use client'

interface TimelineRulerProps {
  duration: number
  bpm: number
  pixelsPerSecond: number
  playheadProgress: number
  /** Show seconds alongside bar numbers */
  showSeconds?: boolean
}

export function TimelineRuler({ duration, bpm, pixelsPerSecond, playheadProgress, showSeconds = true }: TimelineRulerProps) {
  const beatsPerBar = 4
  const secondsPerBeat = 60 / bpm
  const secondsPerBar = secondsPerBeat * beatsPerBar
  const bars = Math.ceil(duration / secondsPerBar) || 16
  const totalWidth = Math.max(duration * pixelsPerSecond, 800)

  const formatSeconds = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    const ms = Math.floor((s % 1) * 10)
    return `${m}:${sec.toString().padStart(2, '0')}.${ms}`
  }

  return (
    <div className="relative h-10 shrink-0 border-b border-[rgb(var(--daw-border))] bg-[rgb(var(--daw-bg-panel)/0.8)]" style={{ minWidth: totalWidth }}>
      {/* Grid lines - bars */}
      {Array.from({ length: bars + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-[rgb(var(--daw-border-strong)/0.8)]"
          style={{ left: i * secondsPerBar * pixelsPerSecond }}
        />
      ))}
      {/* Bar numbers + seconds */}
      {Array.from({ length: bars }).map((_, i) => {
        const left = i * secondsPerBar * pixelsPerSecond + 4
        const timeSec = i * secondsPerBar
        return (
          <div key={i} className="absolute top-0.5 left-0 flex flex-col" style={{ left }}>
            <span className="text-[10px] font-mono text-[rgb(var(--daw-text-muted))]">{i + 1}</span>
            {showSeconds && (
              <span className="text-[9px] font-mono text-[rgb(var(--daw-text-muted)/0.7)]">{formatSeconds(timeSec)}</span>
            )}
          </div>
        )
      })}
      {/* Playhead */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-[rgb(var(--daw-record))] z-10 pointer-events-none"
        style={{ left: totalWidth * playheadProgress, boxShadow: '0 0 8px rgb(var(--daw-record) / 0.6)' }}
      />
    </div>
  )
}
