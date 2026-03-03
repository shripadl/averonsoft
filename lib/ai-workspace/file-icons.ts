/**
 * File type to icon/language mapping for the file tree.
 */

export const FILE_EXTENSION_MAP: Record<string, { language: string; icon: string }> = {
  ts: { language: 'typescript', icon: 'ts' },
  tsx: { language: 'typescript', icon: 'tsx' },
  js: { language: 'javascript', icon: 'js' },
  jsx: { language: 'javascript', icon: 'jsx' },
  py: { language: 'python', icon: 'py' },
  json: { language: 'json', icon: 'json' },
  html: { language: 'html', icon: 'html' },
  css: { language: 'css', icon: 'css' },
  scss: { language: 'scss', icon: 'scss' },
  md: { language: 'markdown', icon: 'md' },
  sql: { language: 'sql', icon: 'sql' },
  yaml: { language: 'yaml', icon: 'yaml' },
  yml: { language: 'yaml', icon: 'yaml' },
}

export function getFileInfo(filePath: string): { language: string; iconKey: string } {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''
  const info = FILE_EXTENSION_MAP[ext]
  if (info) {
    return { language: info.language, iconKey: info.icon }
  }
  return { language: 'plaintext', iconKey: 'file' }
}
