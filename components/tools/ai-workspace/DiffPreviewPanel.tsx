'use client'

import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DiffPreviewPanelProps {
  original: string
  proposed: string
  fileName: string
  onApply: () => void
  onCancel: () => void
  isApplying?: boolean
}

export function DiffPreviewPanel({
  original,
  proposed,
  fileName,
  onApply,
  onCancel,
  isApplying,
}: DiffPreviewPanelProps) {
  const origLines = original.split('\n')
  const propLines = proposed.split('\n')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
      <div className="flex flex-col w-full max-w-6xl max-h-[90vh] rounded-xl border border-border bg-surface shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
          <h3 className="font-semibold text-foreground">Preview: {fileName}</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={onApply} disabled={isApplying}>
              <Check className="h-4 w-4 mr-1" />
              {isApplying ? 'Applying...' : 'Apply'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel} disabled={isApplying}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 gap-4 min-h-0">
            <div>
              <div className="text-xs font-medium text-foreground-muted mb-2">Original</div>
              <div className="font-mono text-sm rounded border border-border overflow-hidden overflow-y-auto max-h-96">
                {origLines.map((line, i) => (
                  <div key={i} className="px-3 py-0.5 border-l-2 border-red-500/50 bg-red-500/5">
                    {line || ' '}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-foreground-muted mb-2">Proposed</div>
              <div className="font-mono text-sm rounded border border-border overflow-hidden overflow-y-auto max-h-96">
                {propLines.map((line, i) => (
                  <div key={i} className="px-3 py-0.5 border-l-2 border-green-500/50 bg-green-500/5">
                    {line || ' '}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
