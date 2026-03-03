'use client'

import { X } from 'lucide-react'
import type { WorkspaceFile } from './FileTree'

interface EditorTabsProps {
  openFiles: WorkspaceFile[]
  selectedFileId: string | null
  onSelectFile: (file: WorkspaceFile) => void
  onCloseFile: (file: WorkspaceFile) => void
  unsavedFileIds?: Set<string>
}

export function EditorTabs({
  openFiles,
  selectedFileId,
  onSelectFile,
  onCloseFile,
  unsavedFileIds = new Set(),
}: EditorTabsProps) {
  if (openFiles.length === 0) return null

  return (
    <div className="flex shrink-0 overflow-x-auto border-b border-border bg-surface scrollbar-thin transition-all duration-200">
      <div className="flex min-w-0">
        {openFiles.map((file) => {
          const isSelected = selectedFileId === file.id
          const isUnsaved = unsavedFileIds.has(file.id)
          const displayName = file.file_path.split('/').pop() || file.file_path

          return (
            <div
              key={file.id}
              className={`
                group flex items-center gap-2 shrink-0 max-w-[180px] px-3 py-2 border-r border-border
                transition-colors duration-200
                ${isSelected ? 'bg-background text-foreground' : 'bg-surface-hover/50 text-foreground-muted hover:bg-surface-hover hover:text-foreground'}
              `}
            >
              <button
                className="flex flex-1 min-w-0 items-center gap-2 text-left text-sm truncate"
                onClick={() => onSelectFile(file)}
                title={file.file_path}
              >
                <span className="truncate">{displayName}</span>
                {isUnsaved && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Unsaved" />
                )}
              </button>
              <button
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/20 text-foreground-muted hover:text-destructive transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseFile(file)
                }}
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
