'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Editor, FileTree, ChatPanel, DiffViewer, ApplyChangesButton, EditorTabs, Breadcrumbs, EditorStatusBar, CommandPalette } from '@/components/tools/ai-workspace'
import type { PaletteMode } from '@/components/tools/ai-workspace'
import type { WorkspaceFile } from '@/components/tools/ai-workspace'
import { useTheme } from 'next-themes'
import type { AIFileAction } from '@/lib/ai-workspace/types'
import { applyDiffPatch } from '@/lib/ai-workspace/parser'
import { getFileInfo } from '@/lib/ai-workspace/file-icons'

const WORKSPACE_ID = 'default'
const MAX_OPEN_TABS = 12

export function AIWorkspaceClient({ initialFiles, aiEnabled = false }: { initialFiles: WorkspaceFile[]; aiEnabled?: boolean }) {
  const [files, setFiles] = useState<WorkspaceFile[]>(initialFiles)
  const [openFiles, setOpenFiles] = useState<WorkspaceFile[]>([])
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null)
  const [content, setContent] = useState('')
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 })
  const [lastSavedContent, setLastSavedContent] = useState<Record<string, string>>({})
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [paletteMode, setPaletteMode] = useState<PaletteMode>('commands')
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [isChatLoading, setChatLoading] = useState(false)
  const [diffState, setDiffState] = useState<{
    original: string
    newContent: string
    fileName: string
  } | null>(null)
  const [isDiffApplying, setDiffApplying] = useState(false)
  const [isDiffLoading, setDiffLoading] = useState(false)
  const { resolvedTheme } = useTheme()

  const loadFiles = useCallback(async () => {
    const res = await fetch(`/api/ai-workspace/files?workspace_id=${WORKSPACE_ID}`)
    if (res.ok) {
      const { files: f } = await res.json()
      setFiles(f || [])
    }
  }, [])

  const saveFile = useCallback(async (filePath: string, fileContent: string, fileName: string, language?: string) => {
    const res = await fetch('/api/ai-workspace/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_path: filePath,
        file_name: fileName,
        content: fileContent,
        language,
        workspace_id: WORKSPACE_ID,
      }),
    })
    if (res.ok) {
      const { file } = await res.json()
      setFiles(prev => {
        const idx = prev.findIndex(f => f.id === file.id || f.file_path === filePath)
        const next = [...prev]
        if (idx >= 0) next[idx] = file
        else next.push(file)
        return next
      })
      return file as WorkspaceFile
    }
    throw new Error('Failed to save')
  }, [])

  const deleteFile = useCallback(async (fileId: string) => {
    const res = await fetch(`/api/ai-workspace/files?id=${fileId}`, { method: 'DELETE' })
    if (res.ok) {
      setFiles(prev => prev.filter(f => f.id !== fileId))
      if (selectedFile?.id === fileId) {
        setSelectedFile(null)
        setContent('')
      }
    }
  }, [selectedFile])

  const handleSelectFile = useCallback((file: WorkspaceFile) => {
    setSelectedFile(file)
    setContent(file.content || '')
    setLastSavedContent(prev => ({ ...prev, [file.file_path]: file.content ?? '' }))
    setOpenFiles(prev => {
      if (prev.some(f => f.id === file.id)) return prev
      const next = [...prev, file]
      return next.length > MAX_OPEN_TABS ? next.slice(-MAX_OPEN_TABS) : next
    })
  }, [])

  const handleCloseFile = useCallback((file: WorkspaceFile) => {
    setOpenFiles(prev => {
      const next = prev.filter(f => f.id !== file.id)
      if (selectedFile?.id === file.id) {
        const nextSelected = next[next.length - 1] ?? null
        setSelectedFile(nextSelected)
        setContent(nextSelected?.content ?? '')
      }
      return next
    })
  }, [selectedFile])

  const handleContentChange = useCallback((value: string) => {
    setContent(value)
    if (selectedFile) {
      const updated = { ...selectedFile, content: value }
      setSelectedFile(updated)
      setFiles(prev => prev.map(f => f.id === updated.id ? updated : f))
    }
  }, [selectedFile])

  const handleSave = useCallback(async () => {
    if (!selectedFile) return
    try {
      await saveFile(
        selectedFile.file_path,
        content,
        selectedFile.file_name,
        selectedFile.language
      )
      setLastSavedContent(prev => ({ ...prev, [selectedFile.file_path]: content }))
    } catch {
      // toast error
    }
  }, [selectedFile, content, saveFile])

  const handleSendMessage = useCallback(async (userContent: string, preferHighQuality?: boolean, agentMode?: boolean) => {
    const newMessages = [...messages, { role: 'user' as const, content: userContent }]
    setMessages(newMessages)
    setChatLoading(true)

    try {
      if (agentMode) {
        const res = await fetch('/api/ai-workspace/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages,
            fileContext: selectedFile ? `File: ${selectedFile.file_path}\n\n${content}` : undefined,
            filePaths: files.map(f => f.file_path),
            preferHighQuality,
          }),
        })
        const data = await res.json()
        if (res.ok && data.parseResult?.success) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.raw || 'Plan generated.',
            parsedActions: data.parseResult.actions,
            explanation: data.parseResult.explanation,
          }])
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.parseResult?.fallback || data.parseResult?.error || data.error || 'Failed to parse response.',
          }])
        }
      } else {
        const res = await fetch('/api/ai-workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages,
            fileContext: selectedFile ? `File: ${selectedFile.file_path}\n\n${content}` : undefined,
            preferHighQuality,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.message.content }])
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }])
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get response.' }])
    } finally {
      setChatLoading(false)
    }
  }, [messages, selectedFile, content, files])

  const handleApplyActions = useCallback(async (actions: AIFileAction[]) => {
    for (const action of actions) {
      if (action.action === 'create_file') {
        const path = (action as { path: string; content: string }).path
        const fileContent = (action as { content: string }).content
        const fileName = path.split('/').pop() || path
        const { language } = getFileInfo(path)
        const file = await saveFile(path, fileContent, fileName, language)
        if (file) {
          setFiles(prev => [...prev, file])
          setSelectedFile(file)
          setContent(fileContent)
          setLastSavedContent(prev => ({ ...prev, [path]: fileContent }))
          setOpenFiles(prev => (prev.some(f => f.id === file.id) ? prev : [...prev, file].slice(-MAX_OPEN_TABS)))
        }
      } else if (action.action === 'update_file') {
        const path = (action as { path: string; content: string }).path
        const fileContent = (action as { content: string }).content
        const fileName = path.split('/').pop() || path
        const { language } = getFileInfo(path)
        const file = await saveFile(path, fileContent, fileName, language)
        if (file) {
          setFiles(prev => {
            const idx = prev.findIndex(f => f.file_path === path)
            const next = [...prev]
            if (idx >= 0) next[idx] = file
            else next.push(file)
            return next
          })
          if (selectedFile?.file_path === path) {
            setContent(fileContent)
          }
          setLastSavedContent(prev => ({ ...prev, [path]: fileContent }))
        }
      } else if (action.action === 'modify_file') {
        const path = (action as { path: string; diff: string }).path
        const diff = (action as { diff: string }).diff
        const existing = files.find(f => f.file_path === path)
        const original = existing?.content || ''
        const newContent = applyDiffPatch(original, diff)
        const fileName = path.split('/').pop() || path
        const { language } = getFileInfo(path)
        const file = await saveFile(path, newContent, fileName, language)
        if (file) {
          setFiles(prev => prev.map(f => f.file_path === path ? file : f))
          if (selectedFile?.file_path === path) setContent(newContent)
          setLastSavedContent(prev => ({ ...prev, [path]: newContent }))
        }
      } else if (action.action === 'delete_file') {
        const path = (action as { path: string }).path
        const file = files.find(f => f.file_path === path)
        if (file) {
          await fetch(`/api/ai-workspace/files?id=${file.id}`, { method: 'DELETE' })
          setFiles(prev => prev.filter(f => f.id !== file.id))
          if (selectedFile?.id === file.id) {
            setSelectedFile(null)
            setContent('')
          }
        }
      } else if (action.action === 'rename_file') {
        const path = (action as { path: string; newPath: string }).path
        const newPath = (action as { newPath: string }).newPath
        const file = files.find(f => f.file_path === path)
        if (file) {
          const newContent = file.content || ''
          const newFileName = newPath.split('/').pop() || newPath
          const { language } = getFileInfo(newPath)
          const newFile = await saveFile(newPath, newContent, newFileName, language)
          await fetch(`/api/ai-workspace/files?id=${file.id}`, { method: 'DELETE' })
          setFiles(prev => prev.filter(f => f.id !== file.id).concat(newFile ? [newFile] : []))
          if (selectedFile?.id === file.id && newFile) {
            setSelectedFile(newFile)
            setContent(newContent)
          }
        }
      }
    }
    loadFiles()
  }, [saveFile, files, selectedFile, loadFiles])

  const handleGenerateDiff = useCallback(async () => {
    if (!selectedFile) return
    setDiffLoading(true)
    try {
      const lastUser = messages.filter(m => m.role === 'user').pop()?.content || 'Improve this code'
      const res = await fetch('/api/ai-workspace/diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: content,
          userRequest: lastUser,
          language: selectedFile.language || 'plaintext',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setDiffState({
          original: content,
          newContent: data.newContent,
          fileName: selectedFile.file_name,
        })
      }
    } finally {
      setDiffLoading(false)
    }
  }, [selectedFile, content, messages])

  const handleApplyDiff = useCallback(() => {
    if (diffState) {
      setContent(diffState.newContent)
      setDiffState(null)
      setDiffApplying(false)
    }
  }, [diffState])

  const handleAddFile = useCallback(async () => {
    const name = prompt('File path (e.g. src/index.ts):')
    if (!name?.trim()) return
    const path = name.trim()
    const fileName = path.split('/').pop() || path
    try {
      const file = await saveFile(path, '', fileName)
      if (file) {
        setFiles(prev => [...prev, file])
        setSelectedFile(file)
        setContent('')
      }
    } catch {
      // Save failed
    }
  }, [saveFile])

  const unsavedFileIds = useMemo(() => {
    const ids = new Set<string>()
    for (const f of openFiles) {
      const currentContent = f.id === selectedFile?.id ? content : (files.find(x => x.id === f.id)?.content ?? '')
      const saved = lastSavedContent[f.file_path] ?? ''
      if (currentContent !== saved) ids.add(f.id)
    }
    return ids
  }, [openFiles, selectedFile?.id, content, files, lastSavedContent])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault()
          setPaletteMode('commands')
          setPaletteOpen(true)
        } else if (e.key === 'p') {
          e.preventDefault()
          setPaletteMode('files')
          setPaletteOpen(true)
        } else if (e.shiftKey && e.key === 'F') {
          e.preventDefault()
          setPaletteMode('search')
          setPaletteOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handlePaletteCommand = useCallback((cmd: string) => {
    if (cmd === 'save') handleSave()
    else if (cmd === 'add_file') handleAddFile()
    else if (cmd === 'toggle_theme') {
      const html = document.documentElement
      html.classList.toggle('dark')
    }
  }, [handleSave, handleAddFile])

  const editorTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light'

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 transition-all duration-200">
      <div className="w-56 shrink-0 transition-all duration-200">
        <FileTree
          files={files}
          selectedFileId={selectedFile?.id ?? null}
          onSelectFile={handleSelectFile}
          onDeleteFile={deleteFile}
          onUploadClick={handleAddFile}
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0 transition-all duration-200">
        <EditorTabs
          openFiles={openFiles}
          selectedFileId={selectedFile?.id ?? null}
          onSelectFile={handleSelectFile}
          onCloseFile={handleCloseFile}
          unsavedFileIds={unsavedFileIds}
        />
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 gap-2">
          <div className="flex items-center gap-4 min-w-0">
            {selectedFile ? (
              <Breadcrumbs filePath={selectedFile.file_path} />
            ) : (
              <span className="text-sm text-foreground-muted">No file selected</span>
            )}
          </div>
          <div className="flex gap-2">
            <ApplyChangesButton
              onClick={handleGenerateDiff}
              disabled={!selectedFile || !aiEnabled}
              isLoading={isDiffLoading}
            />
            <button
              onClick={handleSave}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-hover"
            >
              Save
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          {selectedFile ? (
            <>
              <div className="flex-1 min-h-0 p-4">
                <Editor
                  value={content}
                  onChange={handleContentChange}
                  language={selectedFile.language}
                  filePath={selectedFile.file_path}
                  theme={editorTheme}
                  onCursorChange={setCursorPos}
                />
              </div>
              <EditorStatusBar
                line={cursorPos.line}
                column={cursorPos.column}
                language={getFileInfo(selectedFile.file_path).language}
                filePath={selectedFile.file_path}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-foreground-muted">
              Select a file or add a new one
            </div>
          )}
        </div>
      </div>

      <div className="w-80 shrink-0 transition-all duration-200">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isChatLoading}
          fileContext={selectedFile ? content : undefined}
          disabled={!aiEnabled}
          filePaths={files.map(f => f.file_path)}
          onApplyActions={aiEnabled ? handleApplyActions : undefined}
        />
      </div>

      {diffState && (
        <DiffViewer
          originalContent={diffState.original}
          newContent={diffState.newContent}
          fileName={diffState.fileName}
          onClose={() => setDiffState(null)}
          onApply={handleApplyDiff}
          isApplying={isDiffApplying}
        />
      )}

      <CommandPalette
        open={paletteOpen}
        mode={paletteMode}
        onClose={() => setPaletteOpen(false)}
        files={files}
        onSelectFile={handleSelectFile}
        onCommand={handlePaletteCommand}
        searchContent={globalSearchQuery}
        onSearchContent={setGlobalSearchQuery}
      />
    </div>
  )
}
