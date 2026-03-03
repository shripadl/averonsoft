'use client'

import { ReactNode, useCallback } from 'react'

interface AudioClipProps {
  label: string
  isSelected: boolean
  color: string
  children: ReactNode
  onContextMenu?: (e: React.MouseEvent) => void
  onClick?: () => void
}

export function AudioClip({ label, isSelected, color, children, onContextMenu, onClick }: AudioClipProps) {
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onContextMenu?.(e)
    },
    [onContextMenu]
  )

  return (
    <div
      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
        isSelected
          ? 'border-[rgb(var(--daw-accent))] shadow-[0_0_0_1px_rgb(var(--daw-accent)/0.5)]'
          : 'border-transparent hover:border-[rgb(var(--daw-border-strong))]'
      }`}
      style={{ backgroundColor: `${color}22` }}
      onContextMenu={handleContextMenu}
      onClick={onClick}
    >
      {/* Clip label */}
      <div className="absolute top-0 left-0 right-0 px-2 py-0.5 bg-gradient-to-b from-black/40 to-transparent z-10 pointer-events-none">
        <span className="text-[10px] font-medium text-white truncate block drop-shadow-md">{label}</span>
      </div>

      {/* Fade handle left */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/30 to-transparent cursor-ew-resize z-20 hover:from-black/50" title="Fade in" />

      {/* Fade handle right */}
      <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-black/30 to-transparent cursor-ew-resize z-20 hover:from-black/50" title="Fade out" />

      {/* Trim handle left */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r bg-[rgb(var(--daw-border-strong))] cursor-ew-resize z-20 hover:bg-[rgb(var(--daw-accent))] opacity-60 hover:opacity-100" title="Trim start" />

      {/* Trim handle right */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-l bg-[rgb(var(--daw-border-strong))] cursor-ew-resize z-20 hover:bg-[rgb(var(--daw-accent))] opacity-60 hover:opacity-100" title="Trim end" />

      {/* Content */}
      <div className="relative z-0">{children}</div>
    </div>
  )
}
