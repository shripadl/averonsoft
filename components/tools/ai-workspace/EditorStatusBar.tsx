'use client'

interface EditorStatusBarProps {
  line: number
  column: number
  language: string
  filePath?: string
}

export function EditorStatusBar({ line, column, language, filePath }: EditorStatusBarProps) {
  return (
    <div className="flex items-center justify-end gap-4 px-3 py-1.5 text-xs text-foreground-muted border-t border-border bg-surface">
      <span>Ln {line}, Col {column}</span>
      <span>{language}</span>
      {filePath && (
        <span className="truncate max-w-[200px]" title={filePath}>
          {filePath}
        </span>
      )}
    </div>
  )
}
