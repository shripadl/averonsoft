'use client'

import { useCallback } from 'react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export interface CursorPosition {
  line: number
  column: number
}

interface EditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  filePath?: string
  theme?: 'vs-dark' | 'light'
  onCursorChange?: (pos: CursorPosition) => void
}

export function Editor({ value, onChange, language = 'plaintext', filePath, theme = 'vs-dark', onCursorChange }: EditorProps) {
  const handleChange = useCallback(
    (val: string | undefined) => {
      onChange(val || '')
    },
    [onChange]
  )

  const handleEditorMount = useCallback(
    (editor: { getPosition: () => { lineNumber: number; column: number } | null; onDidChangeCursorPosition: (cb: () => void) => { dispose: () => void } }) => {
      if (!onCursorChange) return
      const updateCursor = () => {
        const pos = editor.getPosition()
        if (pos) onCursorChange({ line: pos.lineNumber, column: pos.column })
      }
      updateCursor()
      editor.onDidChangeCursorPosition(() => updateCursor())
    },
    [onCursorChange]
  )

  const lang = getLanguageFromPath(filePath) || language

  return (
    <div className="h-full w-full min-h-[400px] rounded-lg overflow-hidden border border-border">
      <MonacoEditor
        height="100%"
        language={lang}
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme={theme}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          folding: true,
          bracketPairColorization: { enabled: true },
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 16 },
          scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
          suggest: { showWords: true },
          quickSuggestions: true,
        }}
        loading={
          <div className="flex h-full items-center justify-center bg-surface text-foreground-secondary">
            Loading editor...
          </div>
        }
      />
    </div>
  )
}

function getLanguageFromPath(path?: string): string {
  if (!path) return 'plaintext'
  const ext = path.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    jsx: 'javascript',
    py: 'python',
    json: 'json',
    html: 'html',
    css: 'css',
    md: 'markdown',
    sql: 'sql',
  }
  return map[ext || ''] || 'plaintext'
}
