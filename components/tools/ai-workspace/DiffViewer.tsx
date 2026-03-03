'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DiffViewerProps {
  originalContent: string
  newContent: string
  fileName?: string
  onClose: () => void
  onApply: () => void
  isApplying?: boolean
}

export function DiffViewer({
  originalContent,
  newContent,
  fileName,
  onClose,
  onApply,
  isApplying,
}: DiffViewerProps) {
  const originalLines = originalContent.split('\n')
  const newLines = newContent.split('\n')
  const maxLines = Math.max(originalLines.length, newLines.length)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-semibold text-foreground">
            Diff: {fileName || 'file'}
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={onApply}
              disabled={isApplying}
            >
              {isApplying ? 'Applying...' : 'Apply Changes'}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-auto">
          <div className="flex-1 overflow-auto border-r border-border">
            <div className="p-4 font-mono text-sm">
              <div className="mb-2 text-xs font-medium text-foreground-muted">Original</div>
              {originalLines.map((line, i) => (
                <div key={i} className="text-red-600 dark:text-red-400">
                  {line || ' '}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="p-4 font-mono text-sm">
              <div className="mb-2 text-xs font-medium text-foreground-muted">New</div>
              {newLines.map((line, i) => (
                <div key={i} className="text-green-600 dark:text-green-400">
                  {line || ' '}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
