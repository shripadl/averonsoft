'use client'

interface TimelineMinimapProps {
  duration: number
  pixelsPerSecond: number
  viewportWidth: number
  scrollLeft: number
  playheadProgress: number
  trackCount: number
  onSeek?: (progress: number) => void
}

export function TimelineMinimap({
  duration,
  pixelsPerSecond,
  viewportWidth,
  scrollLeft,
  playheadProgress,
  trackCount,
  onSeek,
}: TimelineMinimapProps) {
  const totalWidth = Math.max(duration * pixelsPerSecond, 800)
  const minimapWidth = Math.min(viewportWidth, 400)
  const scale = minimapWidth / totalWidth
  const handleWidth = Math.max(viewportWidth * scale, 20)
  const handleLeft = scrollLeft * scale

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const progress = Math.max(0, Math.min(1, x / minimapWidth))
    onSeek(progress)
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 border-t border-[rgb(var(--daw-border))] bg-[rgb(var(--daw-bg-panel)/0.6)]">
      <span className="text-[9px] text-[rgb(var(--daw-text-muted))] uppercase tracking-wider shrink-0">Overview</span>
      <div
        className="relative h-4 flex-1 rounded bg-[rgb(var(--daw-bg))] cursor-pointer overflow-hidden"
        style={{ minWidth: 120, maxWidth: minimapWidth }}
        onClick={handleClick}
      >
        {/* Track representation */}
        <div className="absolute inset-0 flex flex-col">
          {Array.from({ length: Math.min(trackCount, 4) }).map((_, i) => (
            <div key={i} className="flex-1 border-b border-[rgb(var(--daw-border)/0.3)] last:border-0" />
          ))}
        </div>
        {/* Viewport handle */}
        <div
          className="absolute top-0 bottom-0 bg-[rgb(var(--daw-accent)/0.25)] border border-[rgb(var(--daw-accent)/0.5)] rounded-sm pointer-events-none"
          style={{ left: handleLeft, width: handleWidth }}
        />
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[rgb(var(--daw-record))] pointer-events-none z-10"
          style={{ left: playheadProgress * minimapWidth }}
        />
      </div>
    </div>
  )
}
