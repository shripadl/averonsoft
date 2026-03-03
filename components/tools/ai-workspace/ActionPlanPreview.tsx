'use client'

import { FilePlus, FileEdit, FileMinus, FileInput } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AIFileAction } from '@/lib/ai-workspace/types'

interface ActionPlanPreviewProps {
  actions: AIFileAction[]
  explanation?: string
  onApprove: () => void
  onReject: () => void
  isLoading?: boolean
}

function getActionIcon(action: AIFileAction) {
  switch (action.action) {
    case 'create_file':
      return <FilePlus className="h-4 w-4 text-green-600" />
    case 'update_file':
    case 'modify_file':
      return <FileEdit className="h-4 w-4 text-amber-600" />
    case 'delete_file':
      return <FileMinus className="h-4 w-4 text-red-600" />
    case 'rename_file':
      return <FileInput className="h-4 w-4 text-blue-600" />
    default:
      return <FileEdit className="h-4 w-4 text-foreground-muted" />
  }
}

function getActionLabel(action: AIFileAction): string {
  switch (action.action) {
    case 'create_file':
      return 'Create'
    case 'update_file':
      return 'Update'
    case 'modify_file':
      return 'Modify'
    case 'delete_file':
      return 'Delete'
    case 'rename_file':
      return `Rename → ${(action as { newPath: string }).newPath}`
    default:
      return (action as AIFileAction).action ?? 'Unknown'
  }
}

export function ActionPlanPreview({
  actions,
  explanation,
  onApprove,
  onReject,
  isLoading,
}: ActionPlanPreviewProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Plan ({actions.length} actions)</h4>
      {explanation && (
        <p className="text-xs text-foreground-muted">{explanation}</p>
      )}
      <ul className="space-y-2">
        {actions.map((action, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm"
          >
            {getActionIcon(action)}
            <span className="font-medium text-foreground">{getActionLabel(action)}</span>
            <span className="text-foreground-muted truncate">{(action as { path: string }).path}</span>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={onApprove} disabled={isLoading}>
          {isLoading ? 'Applying...' : 'Apply All'}
        </Button>
        <Button size="sm" variant="secondary" onClick={onReject} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
