'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, FileCode, Command } from 'lucide-react'
import type { WorkspaceFile } from './FileTree'

export type PaletteMode = 'commands' | 'files' | 'search'

interface CommandPaletteProps {
  open: boolean
  mode: PaletteMode
  onClose: () => void
  files: WorkspaceFile[]
  onSelectFile: (file: WorkspaceFile) => void
  onCommand?: (cmd: string) => void
  searchContent?: string
  onSearchContent?: (query: string) => void
}

const COMMANDS = [
  { id: 'save', label: 'Save file', shortcut: 'Ctrl+S' },
  { id: 'add_file', label: 'Add new file', shortcut: '' },
  { id: 'toggle_theme', label: 'Toggle dark/light theme', shortcut: '' },
]

export function CommandPalette({
  open,
  mode,
  onClose,
  files,
  onSelectFile,
  onCommand,
  searchContent = '',
  onSearchContent,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredFiles = useMemo(() => {
    if (!query.trim()) return files
    const q = query.toLowerCase()
    return files.filter(
      f =>
        f.file_path.toLowerCase().includes(q) ||
        f.file_name.toLowerCase().includes(q)
    )
  }, [files, query])

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return COMMANDS
    const q = query.toLowerCase()
    return COMMANDS.filter(c => c.label.toLowerCase().includes(q))
  }, [query])

  const itemCount = mode === 'files' ? filteredFiles.length : filteredCommands.length
  const safeIndex = Math.min(Math.max(0, selectedIndex), Math.max(0, itemCount - 1))

  const handleSelect = useCallback(() => {
    if (mode === 'files' && filteredFiles[safeIndex]) {
      onSelectFile(filteredFiles[safeIndex])
      onClose()
    } else if (mode === 'commands' && filteredCommands[safeIndex]) {
      onCommand?.(filteredCommands[safeIndex].id)
      onClose()
    }
  }, [mode, filteredFiles, filteredCommands, safeIndex, onSelectFile, onCommand, onClose])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelectedIndex(0)
  }, [open, mode])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, itemCount - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSelect()
        return
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, itemCount, handleSelect, onClose])

  if (!open) return null

  const placeholder =
    mode === 'files'
      ? 'Search files... (Ctrl+P)'
      : mode === 'search'
        ? 'Search in files... (Ctrl+Shift+F)'
        : 'Type a command... (Ctrl+K)'

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 transition-opacity duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-lg border border-border bg-surface shadow-xl transition-transform duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          {mode === 'files' ? (
            <FileCode className="h-4 w-4 text-foreground-muted" />
          ) : mode === 'search' ? (
            <Search className="h-4 w-4 text-foreground-muted" />
          ) : (
            <Command className="h-4 w-4 text-foreground-muted" />
          )}
          <input
            type="text"
            value={mode === 'search' ? searchContent : query}
            onChange={e =>
              mode === 'search'
                ? onSearchContent?.(e.target.value)
                : setQuery(e.target.value)
            }
            placeholder={placeholder}
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-foreground-muted"
            autoFocus
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {mode === 'files' &&
            filteredFiles.map((file, i) => (
              <button
                key={file.id}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                  i === safeIndex ? 'bg-primary/10 text-foreground' : 'text-foreground-muted hover:bg-surface-hover'
                }`}
                onClick={() => {
                  onSelectFile(file)
                  onClose()
                }}
              >
                <FileCode className="h-4 w-4 shrink-0" />
                <span className="truncate">{file.file_path}</span>
              </button>
            ))}
          {mode === 'commands' &&
            filteredCommands.map((cmd, i) => (
              <button
                key={cmd.id}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm ${
                  i === safeIndex ? 'bg-primary/10 text-foreground' : 'text-foreground-muted hover:bg-surface-hover'
                }`}
                onClick={() => {
                  onCommand?.(cmd.id)
                  onClose()
                }}
              >
                <span>{cmd.label}</span>
                {cmd.shortcut && (
                  <span className="text-xs text-foreground-muted">{cmd.shortcut}</span>
                )}
              </button>
            ))}
          {mode === 'search' && (
            <div className="px-3 py-4 text-sm text-foreground-muted">
              Global search: Enter a query above. Results will appear in the chat panel when AI is enabled.
            </div>
          )}
          {((mode === 'files' && filteredFiles.length === 0) ||
            (mode === 'commands' && filteredCommands.length === 0)) && (
            <div className="px-3 py-4 text-sm text-foreground-muted">No results</div>
          )}
        </div>
      </div>
    </div>
  )
}
