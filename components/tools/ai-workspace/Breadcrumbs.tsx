'use client'

import { ChevronRight } from 'lucide-react'

interface BreadcrumbsProps {
  filePath: string
  onNavigate?: (path: string) => void
}

export function Breadcrumbs({ filePath, onNavigate }: BreadcrumbsProps) {
  const parts = filePath.split('/').filter(Boolean)
  if (parts.length === 0) return null

  return (
    <nav className="flex items-center gap-1 text-sm text-foreground-muted" aria-label="Breadcrumb">
      {parts.map((part, i) => {
        const fullPath = '/' + parts.slice(0, i + 1).join('/')
        const isLast = i === parts.length - 1

        return (
          <span key={fullPath} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
            {isLast ? (
              <span className="font-medium text-foreground truncate max-w-[120px]" title={part}>
                {part}
              </span>
            ) : onNavigate ? (
              <button
                className="hover:text-foreground truncate max-w-[80px]"
                onClick={() => onNavigate(fullPath)}
                title={fullPath}
              >
                {part}
              </button>
            ) : (
              <span className="truncate max-w-[80px]">{part}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
