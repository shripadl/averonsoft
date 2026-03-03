'use client'

import { useState } from 'react'
import { File, Folder, Trash2, Plus, ChevronRight, ChevronDown, FileCode, FileJson, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getFileInfo } from '@/lib/ai-workspace/file-icons'

function FileIcon({ filePath }: { filePath: string }) {
  const { iconKey } = getFileInfo(filePath)
  if (iconKey === 'ts' || iconKey === 'tsx' || iconKey === 'js' || iconKey === 'jsx' || iconKey === 'py') {
    return <FileCode className="h-4 w-4 text-foreground-muted" />
  }
  if (iconKey === 'json') return <FileJson className="h-4 w-4 text-foreground-muted" />
  if (iconKey === 'md') return <FileText className="h-4 w-4 text-foreground-muted" />
  return <File className="h-4 w-4 text-foreground-muted" />
}

export interface WorkspaceFile {
  id: string
  file_path: string
  file_name: string
  content?: string
  language?: string
}

interface FileTreeProps {
  files: WorkspaceFile[]
  selectedFileId: string | null
  onSelectFile: (file: WorkspaceFile) => void
  onDeleteFile: (fileId: string) => void
  onUploadClick: () => void
  isLoading?: boolean
}

export function FileTree({
  files,
  selectedFileId,
  onSelectFile,
  onDeleteFile,
  onUploadClick,
  isLoading,
}: FileTreeProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/']))

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const tree = buildTree(files)

  return (
    <div className="flex h-full flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="text-sm font-medium text-foreground">Files</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onUploadClick}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 ? (
          <div className="py-8 text-center text-sm text-foreground-muted">
            No files yet. Click + to add.
          </div>
        ) : (
          <TreeNode
            node={tree}
            path="/"
            expandedDirs={expandedDirs}
            toggleDir={toggleDir}
            selectedFileId={selectedFileId}
            onSelectFile={onSelectFile}
            onDeleteFile={onDeleteFile}
            files={files}
          />
        )}
      </div>
    </div>
  )
}

interface TreeNodeData {
  name: string
  children: Map<string, TreeNodeData>
  file?: WorkspaceFile
}

function buildTree(files: WorkspaceFile[]): TreeNodeData {
  const root: TreeNodeData = { name: '', children: new Map() }

  for (const file of files) {
    const parts = file.file_path.split('/').filter(Boolean)
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isFile = i === parts.length - 1

      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          children: new Map(),
          file: isFile ? file : undefined,
        })
      }

      const child = current.children.get(part)!
      if (isFile) child.file = file
      current = child
    }
  }

  return root
}

function TreeNode({
  node,
  path,
  expandedDirs,
  toggleDir,
  selectedFileId,
  onSelectFile,
  onDeleteFile,
  files,
}: {
  node: TreeNodeData
  path: string
  expandedDirs: Set<string>
  toggleDir: (p: string) => void
  selectedFileId: string | null
  onSelectFile: (f: WorkspaceFile) => void
  onDeleteFile: (id: string) => void
  files: WorkspaceFile[]
}) {
  const entries = Array.from(node.children.entries()).sort(([a], [b]) => {
    const aIsDir = node.children.get(a)!.children.size > 0
    const bIsDir = node.children.get(b)!.children.size > 0
    if (aIsDir !== bIsDir) return aIsDir ? -1 : 1
    return a.localeCompare(b)
  })

  return (
    <div className="space-y-0.5">
      {entries.map(([key, child]) => {
        const fullPath = path === '/' ? `/${key}` : `${path}/${key}`
        const isDir = child.children.size > 0
        const isExpanded = expandedDirs.has(fullPath)

        if (isDir) {
          return (
            <div key={fullPath}>
              <button
                className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-left text-sm hover:bg-surface-hover"
                onClick={() => toggleDir(fullPath)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-foreground-muted" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-foreground-muted" />
                )}
                <Folder className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground">{key}</span>
              </button>
              {isExpanded && (
                <div className="ml-4">
                  <TreeNode
                    node={child}
                    path={fullPath}
                    expandedDirs={expandedDirs}
                    toggleDir={toggleDir}
                    selectedFileId={selectedFileId}
                    onSelectFile={onSelectFile}
                    onDeleteFile={onDeleteFile}
                    files={files}
                  />
                </div>
              )}
            </div>
          )
        }

        const file = child.file!
        const isSelected = selectedFileId === file.id

        return (
          <div
            key={file.id}
            className={`group flex items-center gap-1 rounded px-2 py-1.5 ${
              isSelected ? 'bg-primary/10' : 'hover:bg-surface-hover'
            }`}
          >
            <button
              className="flex flex-1 items-center gap-1 text-left text-sm"
              onClick={() => onSelectFile(file)}
            >
              <FileIcon filePath={file.file_path} />
              <span className={isSelected ? 'font-medium text-foreground' : 'text-foreground'}>
                {key}
              </span>
            </button>
            <button
              className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-destructive/20 text-destructive"
              onClick={() => onDeleteFile(file.id)}
              title="Delete file"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
