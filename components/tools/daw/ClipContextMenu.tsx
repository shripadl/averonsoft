'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface ClipContextMenuAction {
  label: string
  onClick: () => void
  disabled?: boolean
}

interface ClipContextMenuProps {
  x: number
  y: number
  actions: ClipContextMenuAction[]
  onClose: () => void
}

export function ClipContextMenu({ x, y, actions, onClose }: ClipContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const menu = (
    <div
      ref={ref}
      className="fixed z-[9999] min-w-[160px] rounded-lg border border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-panel))] py-1 shadow-lg"
      style={{ left: x, top: y }}
    >
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => {
            if (!action.disabled) action.onClick()
            onClose()
          }}
          disabled={action.disabled}
          className="w-full px-3 py-2 text-left text-sm text-[rgb(var(--daw-text))] hover:bg-[rgb(var(--daw-bg-hover))] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {action.label}
        </button>
      ))}
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(menu, document.body) : null
}
